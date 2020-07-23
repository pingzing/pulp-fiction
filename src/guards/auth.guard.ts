import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../api/auth/models';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Getting the request.
    const request = context.switchToHttp().getRequest();
    const cookies = request.cookies;
    console.log(cookies);

    // Getting the JSON Web Token from the authorization header.
    const jwtToken: string = request.headers['authorization'];

    // Checking to see if the token matches the correct format.
    // If it does, then grab the token. If not, throw an 
    // Unauthorized exception.
    let bearerToken: string;
    if (jwtToken.startsWith('Bearer ')) {
      bearerToken = jwtToken.substring(7, jwtToken.length);
    } else {
      throw new UnauthorizedException(`You don't have permission to do that.`);
    }
    
    // Verifying that the token is legitimate.
    const verifiedToken = this.jwtService.verify<JwtPayload>(bearerToken);
    if (verifiedToken) {
      // If the token is legitimate and active, let them pass.
      request.user = verifiedToken;
      return true;
    } else {
      // Otherwise, throw an Unauthorized exception.
      throw new UnauthorizedException(`You don't have permission to do that.`)
    }
  }
}
