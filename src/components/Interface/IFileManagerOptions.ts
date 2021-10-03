import ICulture from "./ICulture"

export default interface IFileManagerOptions {
    gridViewFields: Array<{ fieldName: string; title: string }>;
    tileViewFields: Array<{ fieldName: string; title: string }>;
    titleField: string;
    orderField: string;
    keyField: string;
    mimeField: string;
    sizeField: string;
    urlField: string;
    api: {nodesApi: string;
        userPermissionApi: string;
        userSettingApi: string;}
    culture: ICulture
}
