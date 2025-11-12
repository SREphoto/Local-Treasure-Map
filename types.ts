export enum AppView {
  Map = 'MAP',
  List = 'LIST',
  Find = 'FIND',
  VideoList = 'VIDEO_LIST',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: any[];
}

export enum ChatMode {
  General = 'General',
  WebSearch = 'Web Search',
  LocalSearch = 'Local Search',
  DeepAnalysis = 'Deep Analysis',
}

export interface Location {
  latitude: number;
  longitude: number;
}