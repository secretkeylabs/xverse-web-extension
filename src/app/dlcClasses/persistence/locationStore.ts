// Simple interface to be implemented by a repository to store application
// location.
export interface LocationStore {
  saveLocation(location: string): Promise<void>
  getLocation(): Promise<string | null>
}
