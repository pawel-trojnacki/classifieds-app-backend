export enum ResMessage {
  UserCreated = 'User created successfully',
  AdCreated = 'Ad created successfully',
  AdUpdated = 'Ad updated successfully',
  AdDeleted = 'Ad deleted successfully',
  AdAddedToFavourites = 'Ad added to favourites',
  AdRemovedFromFavourites = 'Ad removed from favourites',
  LoggedIn = 'Logged in successfully',
  LoggedOut = 'Logged out successfully',
}

export enum ErrMessage {
  InvalidCredentials = 'Invlid credentials',
  Unauthorized = 'Unauthorized',
  Unknown = 'Unknown error occured',
  NoAd = 'There is no a such ad',
  NoUser = 'There is no such user',
  UserExists = 'User already exists',
  UserHasAdInFavourites = 'User already has this ad in favourites',
  UserDoesNotHaveAdInFavourites = 'User does not have this ad in favourites',
}
