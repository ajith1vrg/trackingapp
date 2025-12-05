declare module "kalmanjs" {
  export default class KalmanFilter {
    constructor(options?: {
      R?: number;
      Q?: number;
      A?: number;
      B?: number;
      C?: number;
    });
    filter(z: number): number;
    predict(): number;
    correct(z: number): number;
  }
}