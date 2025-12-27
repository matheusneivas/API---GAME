import dotenv from 'dotenv';

dotenv.config();

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export class RawgService {
  private async fetchFromRawg(endpoint: string): Promise<any> {
    try {
      const url = `${RAWG_BASE_URL}${endpoint}${
        endpoint.includes('?') ? '&' : '?'
      }key=${RAWG_API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`RAWG API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar dados da RAWG API:', error);
      throw error;
    }
  }

  async searchGames(query: string, page: number = 1, pageSize: number = 20) {
    return this.fetchFromRawg(
      `/games?search=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
    );
  }

  async getGameDetails(gameId: number) {
    return this.fetchFromRawg(`/games/${gameId}`);
  }

  async getTrendingGames(page: number = 1, pageSize: number = 20) {
    const currentDate = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(currentDate.getMonth() - 1);

    const dateFormat = (date: Date) => date.toISOString().split('T')[0];

    return this.fetchFromRawg(
      `/games?dates=${dateFormat(lastMonth)},${dateFormat(currentDate)}&ordering=-added&page=${page}&page_size=${pageSize}`
    );
  }

  async getRecentGames(page: number = 1, pageSize: number = 20) {
    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

    const dateFormat = (date: Date) => date.toISOString().split('T')[0];

    return this.fetchFromRawg(
      `/games?dates=${dateFormat(threeMonthsAgo)},${dateFormat(currentDate)}&ordering=-released&page=${page}&page_size=${pageSize}`
    );
  }
}

export default new RawgService();
