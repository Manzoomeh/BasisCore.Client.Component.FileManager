import FileManagerComponent from "./components/FileManager/FileManager";
import IFileManagerOptions from "./components/Interface/IFileManagerOptions";

const options: IFileManagerOptions = {
    gridViewFields: [
        { fieldName: "title", title: "name" },
        { fieldName: "uploadDate", title: "upload date" },
        { fieldName: "mime", title: "type" },
        { fieldName: "size", title: "size" },
        { fieldName: "url", title: "operation" },
    ],
    tileViewFields: [
        { fieldName: "title", title: "name" },
        { fieldName: "uploadDate", title: "upload date" },
        { fieldName: "size", title: "size" },
        { fieldName: "url", title: "operation" },
    ],
    titleField: "title",
    orderField: "order",
    keyField: "id",
    mimeField: "mime",
    sizeField: "size",
    urlField: "url",

    api: {nodesApi: "server/nodes", userPermissionApi: "server/userPermission" , userSettingApi: "server/userSetting"},
    
    culture:{
            newFolder: 'create folder',
            newFile: 'add file',
            gridView: 'grid view',
            tileView: 'tile view',
            pathTitle: 'path',
            folderName: 'folder name',
            denyUploadMessage: "you don't have upload permit",
            syncBtn: 'apply changes',
            totalSize: 'permitted size',
            usedSize:'used size',
            uploadBtn: 'upload',
            createFolderBtn: 'create',
            fileSizeTitle: 'file Size'
            }
        } 

const container = document.querySelector<HTMLElement>('[data-fm-id="main"]')

FileManagerComponent.createFileManagerAsync(container,options);
