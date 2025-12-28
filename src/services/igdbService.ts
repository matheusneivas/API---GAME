import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;
const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_BASE_URL = 'https://api.igdb.com/v4';

interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  storyline?: string;
  cover?: {
    url?: string;
    image_id?: string;
  };
  rating?: number;
  rating_count?: number;
  first_release_date?: number;
  platforms?: Array<{ name: string }>;
  involved_companies?: Array<{
    company: { name: string };
    developer: boolean;
  }>;
  genres?: Array<{ name: string }>;
  screenshots?: Array<{ url: string }>;
}

export interface Game {
  id: number;
  name: string;
  summary?: string;
  cover?: string;
  rating?: number;
  releaseDate?: string;
  platforms?: string[];
  developers?: string[];
  genres?: string[];
}

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

const gamesCache = new Map<number, { data: Game; timestamp: number }>();
const searchCache = new Map<string, { data: Game[]; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 horas

export class IGDBService {
  private async getAccessToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiresAt) {
      console.log('✅ Usando token IGDB em cache');
      return cachedToken;
    }

    try {
      console.log('🔄 Obtendo novo token IGDB...');

      const response = await axios.post(TWITCH_AUTH_URL, null, {
        params: {
          client_id: IGDB_CLIENT_ID,
          client_secret: IGDB_CLIENT_SECRET,
          grant_type: 'client_credentials',
        },
      });

      cachedToken = response.data.access_token;
      tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);

      console.log(`✅ Token IGDB obtido com sucesso (expira em ${response.data.expires_in}s)`);

      return cachedToken;
    } catch (error: any) {
      console.error('❌ Erro ao obter token IGDB:', error.response?.data || error.message);
      throw new Error('Falha ao autenticar com IGDB API');
    }
  }

  private async makeIGDBRequest(endpoint: string, body: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(`${IGDB_BASE_URL}/${endpoint}`, body, {
        headers: {
          'Client-ID': IGDB_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('⚠️ Token expirado, obtendo novo...');
        cachedToken = null;
        tokenExpiresAt = 0;
        return this.makeIGDBRequest(endpoint, body);
      }

      if (error.response?.status === 429) {
        console.error('❌ Rate limit da IGDB atingido');
        throw new Error('Rate limit atingido. Tente novamente em alguns minutos.');
      }

      console.error('❌ Erro na requisição IGDB:', error.response?.data || error.message);
      throw new Error('Erro ao buscar dados da IGDB');
    }
  }

  private formatCoverUrl(cover?: { url?: string; image_id?: string }): string | undefined {
    if (!cover?.url) return undefined;

    return `https:${cover.url.replace('t_thumb', 't_cover_big')}`;
  }

  private formatGame(game: IGDBGame): Game {
    const developers = game.involved_companies
      ?.filter(ic => ic.developer)
      .map(ic => ic.company.name) || [];

    return {
      id: game.id,
      name: game.name,
      summary: game.summary || game.storyline,
      cover: this.formatCoverUrl(game.cover),
      rating: game.rating ? Math.round(game.rating) / 10 : undefined,
      releaseDate: game.first_release_date
        ? new Date(game.first_release_date * 1000).toISOString()
        : undefined,
      platforms: game.platforms?.map(p => p.name) || [],
      developers,
      genres: game.genres?.map(g => g.name) || [],
    };
  }

  async searchGames(query: string, limit: number = 20): Promise<Game[]> {
    const cacheKey = `${query}_${limit}`;
    const cached = searchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Usando cache de busca: "${query}"`);
      return cached.data;
    }

    const body = `
      fields name, summary, storyline, cover.url, rating, first_release_date,
             platforms.name, involved_companies.company.name, involved_companies.developer,
             genres.name;
      search "${query}";
      limit ${limit};
    `;

    const data = await this.makeIGDBRequest('games', body);
    const games = data.map((game: IGDBGame) => this.formatGame(game));

    searchCache.set(cacheKey, { data: games, timestamp: Date.now() });

    return games;
  }

  async getGameById(id: number): Promise<Game> {
    const cached = gamesCache.get(id);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Usando cache do jogo ID: ${id}`);
      return cached.data;
    }

    const body = `
      fields name, summary, storyline, cover.url, rating, rating_count,
             first_release_date, platforms.name,
             involved_companies.company.name, involved_companies.developer,
             genres.name, screenshots.url;
      where id = ${id};
    `;

    const data = await this.makeIGDBRequest('games', body);

    if (!data || data.length === 0) {
      throw new Error('Jogo não encontrado');
    }

    const game = this.formatGame(data[0]);
    gamesCache.set(id, { data: game, timestamp: Date.now() });

    return game;
  }

  async getTrendingGames(limit: number = 20): Promise<Game[]> {
    const body = `
      fields name, summary, cover.url, rating, first_release_date,
             platforms.name, involved_companies.company.name, involved_companies.developer,
             genres.name;
      where rating > 80 & rating_count > 100;
      sort rating desc;
      limit ${limit};
    `;

    const data = await this.makeIGDBRequest('games', body);
    return data.map((game: IGDBGame) => this.formatGame(game));
  }

  async getRecentReleases(limit: number = 20): Promise<Game[]> {
    const threeMonthsAgo = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);
    const now = Math.floor(Date.now() / 1000);

    const body = `
      fields name, summary, cover.url, rating, first_release_date,
             platforms.name, involved_companies.company.name, involved_companies.developer,
             genres.name;
      where first_release_date >= ${threeMonthsAgo} & first_release_date <= ${now};
      sort first_release_date desc;
      limit ${limit};
    `;

    const data = await this.makeIGDBRequest('games', body);
    return data.map((game: IGDBGame) => this.formatGame(game));
  }
}

export default new IGDBService();
