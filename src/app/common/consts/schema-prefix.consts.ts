export class SchemaPrefix {
  static setADM = (collection: string) => `adm.${collection}`;
  static setAUTH = (collection: string) => `auth.${collection}`;
  static setBITACORA = (collection: string) => `bitacora.${collection}`;
  static setCAT = (collection: string) => `cat.${collection}`;
  static setCORE = (collection: string) => `core.${collection}`;
  static setEXPEDIENTE = (collection: string) => `expediente.${collection}`;
  static setFLUJO = (collection: string) => `flow.${collection}`;
  static setTASK = (collection: string) => `task.${collection}`;
  static setWORKFLOW = (collection: string) => `workflow.${collection}`;
}
