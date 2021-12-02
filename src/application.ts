import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin, SchemaMigrationOptions} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {UserRepository} from './repositories';
import {MySequence} from './sequence';
import {BasicAuthenticationUserService} from './services';
import {BasicAuthenticationStrategyBindings, USER_REPO} from './strategies';
import {BasicAuthenticationStrategy} from './strategies/basic-auth.strategy';
const fs = require('fs');

export {ApplicationConfig};

export class SnsgatewayApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {

    super({
      rest: {
        port: 3100,
        host: '0.0.0.0'
      }
    });

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.component(AuthenticationComponent);

    this.bind(USER_REPO).toClass(UserRepository);

    this.bind(BasicAuthenticationStrategyBindings.USER_SERVICE).toClass(BasicAuthenticationUserService);

    registerAuthenticationStrategy(this, BasicAuthenticationStrategy);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  async migrateSchema(options?: SchemaMigrationOptions) {
    // 1. Run migration scripts provided by connectors
    await super.migrateSchema(options);

    const userRepo = await this.getRepository(UserRepository);

    //Inject users
    if (fs.existsSync('users.json')) {
      console.log("Importing users");
      const userData = JSON.parse(fs.readFileSync('users.json', {encoding: 'utf8'}));

      userData.forEach(async (user: any) => {
        await userRepo.create({username: user.username, password: user.password});
      });
    }

    if (process.env.SNSGATEWAY_USER && process.env.SNSGATEWAY_PASSWORD) {
      console.log("Creating user from proces env");
      await userRepo.create({username: process.env.SNSGATEWAY_USER, password: process.env.SNSGATEWAY_PASSWORD});
    }
  }
}
