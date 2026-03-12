import axios from 'axios';

// Cache de traduções para evitar chamadas repetidas
const translationCache = new Map<string, string>();

export class TranslationService {
  /**
   * Divide texto em chunks de até 400 caracteres (limite da API é 500)
   */
  private splitText(text: string, maxLength: number = 400): string[] {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  /**
   * Traduz texto do inglês para português usando a API MyMemory
   * Usa cache para evitar traduções repetidas
   * Divide textos longos em chunks para respeitar o limite da API
   */
  async translateToPortuguese(text: string): Promise<string> {
    if (!text) return text;

    // Verificar cache
    const cached = translationCache.get(text);
    if (cached) {
      return cached;
    }

    try {
      // Dividir texto em chunks se for muito longo
      const chunks = this.splitText(text);
      const translatedChunks: string[] = [];

      for (const chunk of chunks) {
        // Verificar cache para cada chunk
        const cachedChunk = translationCache.get(chunk);
        if (cachedChunk) {
          translatedChunks.push(cachedChunk);
          continue;
        }

        // Traduzir chunk
        const response = await axios.get('https://api.mymemory.translated.net/get', {
          params: {
            q: chunk,
            langpair: 'en|pt-BR',
          },
          timeout: 5000,
        });

        const translated = response.data?.responseData?.translatedText;

        if (translated) {
          translationCache.set(chunk, translated);
          translatedChunks.push(translated);
        } else {
          translatedChunks.push(chunk);
        }

        // Delay entre requisições para evitar rate limit
        if (chunks.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      const finalTranslation = translatedChunks.join(' ');

      // Salvar tradução completa no cache
      translationCache.set(text, finalTranslation);
      console.log('✅ Texto traduzido com sucesso');

      return finalTranslation;
    } catch (error: any) {
      console.warn('⚠️  Erro ao traduzir texto, usando original:', error.message);
      return text;
    }
  }

  /**
   * Traduz múltiplos textos em paralelo
   */
  async translateMultiple(texts: string[]): Promise<string[]> {
    const promises = texts.map(text => this.translateToPortuguese(text));
    return Promise.all(promises);
  }
}

export default new TranslationService();
