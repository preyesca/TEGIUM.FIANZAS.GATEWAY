import * as moment from 'moment';
import * as timezone from 'moment-timezone';

export class TimeZoneMoment {
  static convertDateZoneTime(
    date: moment.Moment,
    timeZoneToConvert: string,
  ): moment.Moment{
    const serverTimeZone = process.env.TIMEZONE || 'America/Mexico_City';
    const fechaInServer = timezone.tz(date, serverTimeZone);
    return fechaInServer.clone().tz(timeZoneToConvert);
  }
}
