
import IMimePermission from "./IMimePermission";

export default interface IUserPermission{
    mimePermission: Array<IMimePermission>;
    uploadPermission: boolean;
    createFolder: boolean
    totalSize: number;
    usedSize: number;
}