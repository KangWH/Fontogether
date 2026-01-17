// UFO 형식의 폰트 데이터 구조 (JSON 변환 형태)

export interface GlyphData {
  id: number;
  name: string;
  unicode?: number[];
  advanceWidth: number;
  advanceHeight?: number; // 세로쓰기 지원 시
  contours?: Contour[];
  components?: Component[];
  tags?: string[]; // 색상 태그 (빨주노초파보분회)
  groups?: string[]; // 사용자 정의 그룹
  note?: string; // 메모
  openTypeClass?: string;
  lsb?: number; // Left Side Bearing
  rsb?: number; // Right Side Bearing
  tsb?: number; // Top Side Bearing (세로쓰기)
  bsb?: number; // Bottom Side Bearing (세로쓰기)
}

export interface Contour {
  points: Point[];
  closed: boolean;
}

export interface Point {
  x: number;
  y: number;
  type?: 'line' | 'curve' | 'qcurve'; // line, offcurve, curve
  smooth?: boolean;
}

export interface Component {
  base: string; // 참조하는 글리프 이름
  transformation: {
    xScale?: number;
    yScale?: number;
    xOffset?: number;
    yOffset?: number;
    rotation?: number;
  };
}

export interface FontData {
  metadata: FontMetadata;
  metrics: FontMetrics;
  glyphs: GlyphData[];
  features?: FeatureFile;
  groups?: { [key: string]: string[] }; // 그룹 이름 -> 글리프 이름 배열
  kerning?: { [key: string]: number }; // 케닝 데이터
}

export interface FontMetadata {
  familyName: string;
  styleName: string;
  fullName: string;
  postscriptName: string;
  version: string;
  copyright?: string;
  designer?: string;
  manufacturer?: string;
  unitsPerEm: number;
  ascender: number;
  descender: number;
  capHeight: number;
  xHeight: number;
  italicAngle?: number;
  underlinePosition?: number;
  underlineThickness?: number;
  strikeoutPosition?: number;
  strikeoutThickness?: number;
  verticalWriting?: boolean;
  unicodeRanges?: number[][];
  codePages?: number[];
  panose?: number[];
}

export interface FontMetrics {
  unitsPerEm: number;
  ascender: number;
  descender: number;
  capHeight: number;
  xHeight: number;
  italicAngle?: number;
  underlinePosition?: number;
  underlineThickness?: number;
  strikeoutPosition?: number;
  strikeoutThickness?: number;
  verticalWriting?: boolean;
}

export interface FeatureFile {
  languages?: { [key: string]: string }; // 언어 코드 -> 스크립트
  tables?: { [key: string]: string }; // 테이블 선언
  classes?: { [key: string]: string[] }; // 클래스 정의
  lookups?: { [key: string]: string }; // named lookup 선언
  gsub?: { [key: string]: FeatureRule }; // GSUB 기능
  gpos?: { [key: string]: FeatureRule }; // GPOS 기능
}

export interface FeatureRule {
  code: string;
  enabled: boolean;
}

export type SortOption = 
  | 'index' 
  | 'codepoint' 
  | 'name' 
  | 'user-friendly' 
  | 'script-order';

export type FilterCategory = 
  | 'tag' 
  | 'group' 
  | 'language' 
  | 'script' 
  | 'opentype-class' 
  | 'none';

export type ColorTag = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'gray';
