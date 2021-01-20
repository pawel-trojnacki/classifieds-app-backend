export enum ResMessage {
  UserCreated = 'User created successfully',
  AdCreated = 'Ad created successfully',
  AdUpdated = 'Ad updated successfully',
  AdDeleted = 'Ad deleted successfully',
  LoggedIn = 'Logged in successfully',
  LoggedOut = 'Logged out successfully',
}

export enum ErrMessage {
  InvalidCredentials = 'Invlid credentials',
  Unauthorized = 'Unauthorized',
  Unknown = 'Unknown error occured',
  NoAd = 'There is no a such ad',
}
