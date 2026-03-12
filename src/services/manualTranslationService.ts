// Mapeamento manual de traduções para evitar rate limit de APIs externas
const genreTranslations: { [key: string]: string } = {
  // Gêneros
  'Action': 'Ação',
  'Adventure': 'Aventura',
  'RPG': 'RPG',
  'Role-playing (RPG)': 'RPG',
  'Strategy': 'Estratégia',
  'Shooter': 'Tiro',
  'Racing': 'Corrida',
  'Sports': 'Esportes',
  'Fighting': 'Luta',
  'Platformer': 'Plataforma',
  'Puzzle': 'Quebra-cabeça',
  'Simulation': 'Simulação',
  'Horror': 'Terror',
  'Survival': 'Sobrevivência',
  'Stealth': 'Furtividade',
  'Sandbox': 'Mundo Aberto',
  'MMORPG': 'MMORPG',
  'MOBA': 'MOBA',
  'Battle Royale': 'Battle Royale',
  'Card Game': 'Jogo de Cartas',
  'Indie': 'Indie',
  'Arcade': 'Arcade',
  'Tactical': 'Tático',
  'Turn-based strategy (TBS)': 'Estratégia por Turnos',
  'Real Time Strategy (RTS)': 'Estratégia em Tempo Real',
  'Hack and slash/Beat \'em up': 'Hack and Slash',
  'Point-and-click': 'Point-and-click',
  'Visual Novel': 'Novel Visual',
  'Music': 'Musical',
  'Quiz/Trivia': 'Quiz',
  'Pinball': 'Pinball',
};

const platformTranslations: { [key: string]: string } = {
  'PC (Microsoft Windows)': 'PC',
  'PlayStation 4': 'PlayStation 4',
  'PlayStation 5': 'PlayStation 5',
  'Xbox One': 'Xbox One',
  'Xbox Series X|S': 'Xbox Series X|S',
  'Nintendo Switch': 'Nintendo Switch',
  'iOS': 'iOS',
  'Android': 'Android',
  'Mac': 'Mac',
  'Linux': 'Linux',
};

export class ManualTranslationService {
  /**
   * Traduz gêneros de jogos
   */
  translateGenre(genre: string): string {
    return genreTranslations[genre] || genre;
  }

  /**
   * Traduz múltiplos gêneros
   */
  translateGenres(genres: string[]): string[] {
    return genres.map(genre => this.translateGenre(genre));
  }

  /**
   * Traduz nome de plataforma
   */
  translatePlatform(platform: string): string {
    return platformTranslations[platform] || platform;
  }

  /**
   * Traduz múltiplas plataformas
   */
  translatePlatforms(platforms: string[]): string[] {
    return platforms.map(platform => this.translatePlatform(platform));
  }

  /**
   * Retorna descrição em português (por enquanto retorna o original)
   * Pode ser expandido no futuro com traduções manuais de jogos populares
   */
  translateDescription(description: string): string {
    // Por enquanto, retorna o original para evitar rate limit
    // Pode ser expandido com um banco de traduções manuais
    return description;
  }
}

export default new ManualTranslationService();
