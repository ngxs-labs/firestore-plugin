export interface Race {
  id: string;
  raceId: string;
  title: string;
  description: string;
  name: string;
  order: string;

  readonly testProp: string;
}
