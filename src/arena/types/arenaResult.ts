export type ArenaResult = {
  runId: string;

  score: number;
  timeSeconds: number;
  errors: number;

  valid: boolean;

  checksum: string;
};
