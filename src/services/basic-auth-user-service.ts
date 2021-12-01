// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {User, UserRelations} from '../models/user.model';
import {UserRepository} from '../repositories/user.repository';
import {USER_REPO} from '../strategies';
import {BasicAuthenticationStrategyCredentials} from '../strategies/basic-auth.strategy';

export class BasicAuthenticationUserService
  implements UserService<User, BasicAuthenticationStrategyCredentials>
{
  constructor(
    @inject(USER_REPO)
    private userRepository: UserRepository,
  ) { }

  async verifyCredentials(
    credentials: BasicAuthenticationStrategyCredentials,
  ): Promise<User & UserRelations> {
    if (!credentials) {
      throw new HttpErrors.Unauthorized(`'credentials' is null`);
    }

    if (!credentials.username) {
      throw new HttpErrors.Unauthorized(`'credentials.username' is null`);
    }

    if (!credentials.password) {
      throw new HttpErrors.Unauthorized(`'credentials.password' is null`);
    }

    const foundUser = await this.userRepository.findOne({where: {username: credentials.username}});
    if (!foundUser) {
      throw new HttpErrors['Unauthorized'](
        `User with username ${credentials.username} not found.`,
      );
    }

    if (credentials.password !== foundUser.password) {
      throw new HttpErrors.Unauthorized('The password is not correct.');
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    if (!user) {
      throw new HttpErrors.Unauthorized(`'user' is null`);
    }

    if (!user.id) {
      throw new HttpErrors.Unauthorized(`'user id' is null`);
    }

    return {
      [securityId]: user.id,
      name: user.username,
    };
  }
}
