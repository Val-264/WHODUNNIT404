export interface CaseItemDto {
    id: string; 
    title: string; 
    description: string; 
    victimName: string; 
    hasActiveGame: boolean; 
    activeGameId?: string;
}

export class CaseListResponseDTO {
  public static render(stories: any[], activeGameStoryIdsMap: Map<string, string>): CaseItemDto[] {
    return stories.map((story) => ({
      id: story._id.toString(),
      title: story.title,
      description: story.description || story.intro_text,
      victimName: story.victim_name,
      hasActiveGame: activeGameStoryIdsMap.has(story._id.toString()),
      activeGameId: activeGameStoryIdsMap.get(story._id.toString()) || undefined,
    }));
  }
}