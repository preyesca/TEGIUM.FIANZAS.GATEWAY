import * as momentTimes from "moment-business-time";
import * as momentDays from "moment-business-days";
import * as moment from 'moment-timezone';

momentTimes.locale("en");
momentTimes.updateLocale("en", {
    workinghours: {
        0: null,
        1: ["09:00:00", "18:00:00"],
        2: ["09:00:00", "18:00:00"],
        3: ["09:00:00", "18:00:00"],
        4: ["09:00:00", "18:00:00"],
        5: ["09:00:00", "18:00:00"],
        6: null
    },
    holidays: [],
    workingWeekdays: [1, 2, 3, 4, 5]
});

export const getFechaProximaLlamada = ({ clave }) => {

    let dateNow = null;

    //No Contesta
    if (clave == 2) {
        dateNow = momentTimes(Date.now());
        dateNow.addWorkingTime(3, 'hours');
    } else {
        dateNow = momentDays(Date.now());
        switch (Number(clave)) {
            case 3: //En espera documentos digitales
                dateNow = dateNow.businessAdd(2)
                break;
            case 5://En espera firma cliente
            case 6://En espera firma ejecutivo
            case 7://Validacion de firmas
            case 8://Formatos enviados a aseguradora
                dateNow.nextBusinessDay()
                break;
            default:
                dateNow
                break;
        }
    }

    return dateNow;
}


export const getFechaReportLocal = (fechaInput: string): string => {
    if (!fechaInput) {
        return '';
    }
    const fecha = moment.tz(
        new Date(fechaInput),
        process.env.MSH_TIME_ZONE,
    );
    return fecha.format('DD/MM/YYYY HH:mm:ss');
};
