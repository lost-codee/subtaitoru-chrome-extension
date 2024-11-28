interface SearchParams {
  title: string;
  type: 'movie' | 'series';
  episodeNumber?: number;
  seasonNumber?: number;
  rawTitle?: string;
}

interface SubtitleResult {
  title: string;
  language: string;
  url: string;
  source: 'kitsunekko' | 'daddicts';
  confidence: number;
}

interface SubtitleSearchParams {
  title: string;
  episodeInfo?: {
    episodeNumber?: number;
    rawTitle?: string;
  };
}

export class SubtitleFetcher {
  private static async translateToEnglish(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'TRANSLATE', text },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            resolve(text); // Fall back to original text on error
            return;
          }

          if (response && response.success && response.data?.translations?.[0]?.text) {
            resolve(response.data.translations[0].text);
          } else {
            console.error('Translation response error:', response);
            resolve(text); // Fall back to original text on error
          }
        }
      );
    });
  }

  private static calculateConfidence(searchParams: SubtitleSearchParams, subtitleTitle: string): number {
    let confidence = 0;
    
    // Convert both titles to lowercase for comparison
    const normalizedSearchTitle = searchParams.title.toLowerCase();
    const normalizedSubtitleTitle = subtitleTitle.toLowerCase();

    // Extract episode number from subtitle title
    const subtitleEpisodeMatch = subtitleTitle.match(/(?:[-\s]|^)(\d+)(?:\s|$|\u3010|\u300C)/);
    const subtitleEpisodeNum = subtitleEpisodeMatch ? parseInt(subtitleEpisodeMatch[1]) : null;

    console.log('Subtitle title:', subtitleTitle);
    console.log('subtitleEpisodeMatch:', subtitleEpisodeMatch);
    console.log('subtitleEpisodeNum:', subtitleEpisodeNum);

    // Base confidence on title match
    if (normalizedSubtitleTitle.includes(normalizedSearchTitle)) {
      confidence += 0.4;
    }

    // Episode number match (if available)
    if (searchParams.episodeInfo?.episodeNumber !== undefined && subtitleEpisodeNum !== null) {
      if (searchParams.episodeInfo.episodeNumber === subtitleEpisodeNum) {
        confidence += 0.4;
      }
    }

    // Raw title match (if available)
    if (searchParams.episodeInfo?.rawTitle) {
      const normalizedRawTitle = searchParams.episodeInfo.rawTitle.toLowerCase();
      if (normalizedSubtitleTitle.includes(normalizedRawTitle)) {
        confidence += 0.2;
      }
    }

    // File extension bonus
    if (subtitleTitle.endsWith('.ass') || subtitleTitle.endsWith('.srt')) {
      confidence += 0.1;
    }

    // Penalize if episode numbers don't match
    if (searchParams.episodeInfo?.episodeNumber !== undefined && 
        subtitleEpisodeNum !== null && 
        searchParams.episodeInfo.episodeNumber !== subtitleEpisodeNum) {
      confidence -= 0.3;
    }

    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }

  static async searchSubtitles(params: SearchParams): Promise<SubtitleResult[]> {
    try {
      console.log('Searching subtitles for:', params);

      const queries: string[] = [];
      
      if (params.rawTitle) {
        queries.push(params.rawTitle);
      }

      queries.push(params.title);

      const englishTitle = await this.translateToEnglish(params.title);
      if (englishTitle !== params.title) {
        queries.push(englishTitle);
      }

      if (params.type === 'series' && params.episodeNumber) {
        const episodeFormats = [
          `${params.title} S${params.seasonNumber || 1}E${params.episodeNumber}`,
          `${params.title} Episode ${params.episodeNumber}`,
          `${params.title} 第${params.episodeNumber}話`,
          `${englishTitle} Episode ${params.episodeNumber}`
        ];
        queries.push(...episodeFormats);
      }

      console.log('Queries:', queries);

      let allResults: SubtitleResult[] = [];

      for (const query of queries) {
        const kitsunekkoResults = await this.searchKitsunekko(query);
        allResults.push(...kitsunekkoResults.map(result => ({
          ...result,
          source: 'kitsunekko' as const,
          confidence: this.calculateConfidence({ title: query, episodeInfo: params }, result.title)
        })));

        const dAddictsResults = await this.searchDAddicts(query);
        allResults.push(...dAddictsResults.map(result => ({
          ...result,
          source: 'daddicts' as const,
          confidence: this.calculateConfidence({ title: query, episodeInfo: params }, result.title)
        })));
      }

      const uniqueResults = Array.from(new Map(
        allResults.map(result => [result.url, result])
      ).values());

      console.log('Unique results:', uniqueResults);

      return uniqueResults
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5); 

    } catch (error) {
      console.error('Error fetching subtitles:', error);
      return [];
    }
  }

  static async downloadSubtitles(result: SubtitleResult): Promise<string | null> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'DOWNLOAD_SUBTITLE', url: result.url },
        (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            console.error('Subtitle download error:', chrome.runtime.lastError || response?.error);
            reject(new Error('Failed to download subtitle'));
            return;
          }

          try {
            // Convert byte array back to ArrayBuffer
            const uint8Array = new Uint8Array(response.data);
            const buffer = uint8Array.buffer;

            // Try to decode with different encodings
            const encodings = ['utf-8', 'shift-jis', 'euc-jp'];
            
            for (const encoding of encodings) {
              try {
                const decoder = new TextDecoder(encoding);
                const text = decoder.decode(buffer);
                
                // Basic validation - check if the text looks like a subtitle file
                if (text.includes('\n') && (
                  text.includes('.srt') || 
                  text.includes('.ass') || 
                  text.includes('-->') || 
                  text.includes('Dialogue:')
                )) {
                  resolve(text);
                  return;
                }
              } catch (e) {
                console.warn(`Failed to decode with ${encoding}:`, e);
                continue;
              }
            }
            
            reject(new Error('Could not decode subtitle file with any supported encoding'));
          } catch (error) {
            console.error('Error processing subtitle file:', error);
            reject(error);
          }
        }
      );
    });
  }

  private static async searchKitsunekko(query: string): Promise<SubtitleResult[]> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'SEARCH_KITSUNEKKO', query },
        (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            console.error('Kitsunekko search error:', chrome.runtime.lastError || response?.error);
            resolve([]);
            return;
          }

          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, 'text/html');
            const subtitleLinks = doc.querySelectorAll('a[href$=".srt"], a[href$=".ass"]');
            
            const results: SubtitleResult[] = [];
            subtitleLinks.forEach(link => {
              const href = link.getAttribute('href') || '';
              const cleanHref = href.replace(/^\/+/, '').replace(/^subtitles\/japanese\//, '');
              
              const pathComponents = cleanHref.split('/').map(component => 
                encodeURIComponent(component.trim())
              );

              const title = link.textContent?.trim() || cleanHref;
              
              results.push({
                title,
                language: 'ja',
                url: `https://kitsunekko.net/subtitles/japanese/${pathComponents.join('/')}`,
                source: 'kitsunekko',
                confidence: 0
              });
            });

            resolve(results);
          } catch (error) {
            console.error('Error parsing Kitsunekko response:', error);
            resolve([]);
          }
        }
      );
    });
  }

  private static async searchDAddicts(query: string): Promise<SubtitleResult[]> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'SEARCH_DADDICTS', query },
        (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            console.error('D-Addicts search error:', chrome.runtime.lastError || response?.error);
            resolve([]);
            return;
          }

          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, 'text/html');
            const subtitleLinks = doc.querySelectorAll('a[href*=".srt"], a[href*=".ass"]');
            
            const results: SubtitleResult[] = [];
            subtitleLinks.forEach(link => {
              const href = link.getAttribute('href') || '';
              const title = link.textContent?.trim() || href;
              
              if (href.includes('.srt') || href.includes('.ass')) {
                results.push({
                  title,
                  language: 'ja',
                  url: href.startsWith('http') ? href : `https://d-addicts.com${href.startsWith('/') ? '' : '/'}${href}`,
                  source: 'daddicts',
                  confidence: 0
                });
              }
            });

            resolve(results);
          } catch (error) {
            console.error('Error parsing D-Addicts response:', error);
            resolve([]);
          }
        }
      );
    });
  }
}
