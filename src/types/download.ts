export interface DownloadCriterion {
  no: string | number;
  name: string;
  maxPoints: number | string;
  score: number | string;
  compliance?: string;
}

export interface DownloadSection {
  title: string;
  maxPoints: number | string;
  sectionScore: number;
  criteria: DownloadCriterion[];
}

export interface ProjectInfo {
  name?: string;
  siteArea?: string;
  builtUpArea?: string;
  occupancyFixed?: string;
  occupancyFloating?: string;
  climateZone?: string;
}

export interface DownloadData {
  ratingName: string;
  brandColor: string;
  totalPoints: number;
  maxPoints: number;
  starsCount?: number;   // GRIHA: 0-5
  level?: string;        // IGBC: Certified / Silver / Gold / Platinum / None
  sections: DownloadSection[];
  projectInfo: ProjectInfo;
}
