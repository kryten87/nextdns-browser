import { Controller, All, Req, Res } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Controller('nextdns')
export class ProxyController {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('NEXTDNS_API_KEY');
    this.baseUrl = this.configService.get<string>('NEXTDNS_BASE_URL');
  }

  @All('*')
  async proxy(@Req() req, @Res() res) {
    const { method, url, body } = req;
    const target = url.replace(/^\/nextdns\//, this.baseUrl);

    const requestDetails: { [key: string]: any } = {
      method,
      url: target,
      headers: { 'X-Api-Key': this.apiKey },
    };

    if (method !== 'GET') {
      requestDetails.data = body;
    }

    let status = 200;
    let data;
    try {
      const result = await axios(requestDetails);
      status = result.status;
      data = result.data;
    } catch (err) {
      status = err.response.status;
    }
    res.status(status).json(data);
  }
}
