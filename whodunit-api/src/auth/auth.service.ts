import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Player } from './entities/player.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
    private readonly jwtService: JwtService,
  ) {}

  // ── Register ────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Check if username or email already taken
    const exists = await this.playerRepo.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });

    if (exists) {
      throw new ConflictException('Username or email already taken');
    }

    // Hash password and save
    const hashed = await bcrypt.hash(dto.password, 12);

    const player = this.playerRepo.create({
      username: dto.username,
      email: dto.email,
      password: hashed,
    });

    await this.playerRepo.save(player);

    return this.issueToken(player);
  }

  // ── Login ───────────────────────────────────────────────
  async login(dto: LoginDto) {
    const player = await this.playerRepo.findOne({
      where: { username: dto.username },
    });

    if (!player) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, player.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueToken(player);
  }

  // ── Get profile by ID (used by JWT strategy) ───────────
  async getProfile(playerId: string) {
    const player = await this.playerRepo.findOne({
      where: { id: playerId },
    });

    if (!player) {
      throw new UnauthorizedException('Player not found');
    }

    // Strip the password before returning
    const { password, ...profile } = player;
    return profile;
  }

  // ── Issue JWT ───────────────────────────────────────────
  private issueToken(player: Player) {
    const payload = { sub: player.id, username: player.username };
    return {
      access_token: this.jwtService.sign(payload),
      player: {
        id: player.id,
        username: player.username,
        email: player.email,
      },
    };
  }
}
