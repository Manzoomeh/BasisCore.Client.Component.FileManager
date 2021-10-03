import IFileHierarchyNode from "../Interface/IFileHierarchyNode";
import FileManagerComponent from "../../components/FileManager/FileManager";
import IComponent from "../Interface/IComponent";
import IFolderInfo from "../Interface/IFolderInfo";
import IconImageMaker from "../IconImageMaker/IconImageMaker";
import { ViewMode } from "../Interface/types";

export default class ViewComponent implements IComponent {
    private readonly container: Element;
    private activeNode: IFileHierarchyNode;
    private readonly owner: FileManagerComponent;
    private folderName: HTMLInputElement;
    private folderDesc: HTMLTextAreaElement;
    private file: HTMLInputElement;

    constructor(container: Element, owner: FileManagerComponent) {
        this.container = container;
        this.owner = owner;  
        
    }
    public initialize(): void { 
        this.initializeUI();
        this.createPermissionBtnUI();
        this.folderName = this.container.querySelector('[data-fm-input="folderName"]') as HTMLInputElement;
        this.folderDesc = this.container.querySelector('[data-fm-textarea="description"]') as HTMLTextAreaElement;
        this.file = this.container.querySelector('[data-fm-input="file"]') as HTMLInputElement;
        this.updateUI(this.owner.nodes);
        this.addingHandler();
    }

    private initializeUI(): void {
        const clr = document.createElement("div");
        clr.setAttribute("class", "clr");

        const controller = document.createElement("div");
        controller.setAttribute("data-fm-view", "controller");

        const gridIcon = document.createElement("i");
        gridIcon.setAttribute("class", "lni lni-grid-alt");

        const btn3 = document.createElement("button");
        btn3.appendChild(gridIcon);
        btn3.append(this.owner.culture.tileView);
        btn3.setAttribute("data-fm-view-mode", "tile");

        const listIcon = document.createElement("i");
        listIcon.setAttribute("class", "lni lni-list");

        const btn4 = document.createElement("button");
        btn4.appendChild(listIcon);
        btn4.append(this.owner.culture.gridView);
        btn4.setAttribute("data-fm-view-mode", "grid");
        
        const syncIcon = document.createElement("i");
        syncIcon.setAttribute("class", "lni lni-cloud-sync");

        const syncBtn = document.createElement("button");
        syncBtn.appendChild(syncIcon);
        syncBtn.append(this.owner.culture.syncBtn);
        syncBtn.setAttribute("data-fm-view-sync", "data");

        const permission = document.createElement("div");
        permission.setAttribute("data-fm-user", "permission");
        controller.appendChild(permission);

        controller.appendChild(btn3);
        controller.appendChild(btn4);
        controller.appendChild(syncBtn);
        controller.appendChild(clr);

        const view = document.createElement("div");
        view.setAttribute("data-fm-view", "view");

        const viewClr = document.createElement("div");
        viewClr.setAttribute("class", "clr");

        this.container.appendChild(controller);
        this.container.appendChild(view);
        this.container.appendChild(viewClr);
    }

    private createPermissionBtnUI() {
        const controller = this.container.querySelector('[data-fm-view="controller"]');
        const otherBtn = this.container.querySelector('[data-fm-view-mode="tile"]');
        const permission = this.container.querySelector('[data-fm-user="permission"]');

        if (this.owner.userPermission.createFolder == true) {
            //----------------- addFolder ---------------------------
            const dialogBoxBackground = document.createElement("div");
            dialogBoxBackground.setAttribute("data-fm-folderDialogBox","background");
            dialogBoxBackground.setAttribute("data-fm-display", "none");

            const dialogBoxContainer = document.createElement("div");
            dialogBoxContainer.setAttribute("data-fm-folderDialogBox","container");

            const dialogBox = document.createElement("div");
            dialogBox.setAttribute("data-fm-dialogBox", "addFolder");

            const closeDialogBox = document.createElement("div");
            closeDialogBox.setAttribute("data-fm-folderDialogBox", "closeBox");

            const close = document.createElement("div");
            close.setAttribute("data-fm-folderDialogBox", "close");
            close.append("X");

            closeDialogBox.appendChild(close);

            const form = document.createElement("form");
            form.setAttribute("data-fm-dialogBox-form", "createFolder");

            const folderName = document.createElement("input");
            folderName.setAttribute("type", "text");
            folderName.setAttribute("data-fm-input", "folderName");
            folderName.setAttribute("name", "folderName");
            folderName.setAttribute("placeholder",this.owner.culture.folderName);

            const folderDesc = document.createElement("textarea");
            folderDesc.setAttribute("data-fm-textarea", "description");
            folderDesc.setAttribute("name", "description");

            const submit = document.createElement("button");
            submit.setAttribute("data-fm-dialogBox-btn", "createFolder");
            submit.append(this.owner.culture.createFolderBtn);

            dialogBox.appendChild(closeDialogBox);
            dialogBoxContainer.appendChild(dialogBox);
            form.appendChild(folderName);
            form.appendChild(folderDesc);
            form.appendChild(submit);
            dialogBox.appendChild(form);

            this.container.appendChild(dialogBoxBackground);
            this.container.appendChild(dialogBoxContainer);

            const folderIcon = document.createElement("i");
            folderIcon.setAttribute("class", "lni lni-folder");

            const btn1 = document.createElement("button");
            btn1.appendChild(folderIcon);
            btn1.append(this.owner.culture.newFolder);
            btn1.setAttribute("data-fm-view-add", "folder");

            controller.insertBefore(btn1, otherBtn);
        }

        if (this.owner.userPermission.uploadPermission == false) {
            const denyUploadMessage = document.createElement("span");
            denyUploadMessage.append(this.owner.culture.denyUploadMessage);
            denyUploadMessage.setAttribute("data-fm-user", "uploadPermit");
            permission.appendChild(denyUploadMessage);
        } else {
            const totalSize = document.createElement("span");
            totalSize.setAttribute("data-fm-user", "usedSize");
            totalSize.append(
                `${this.owner.culture.totalSize} : ${this.owner.userPermission.totalSize} KB`
            );

            const usedSize = document.createElement("span");
            usedSize.setAttribute("data-fm-user", "totalSize");
            usedSize.append(
                `${this.owner.culture.usedSize} : ${this.owner.userPermission.usedSize} KB`
            );

            const fileIcon = document.createElement("i");
            fileIcon.setAttribute("class", "lni lni-add-files");

            const btn2 = document.createElement("button");
            btn2.appendChild(fileIcon);
            btn2.append(this.owner.culture.newFile);
            btn2.setAttribute("data-fm-view-add", "file");

            permission.appendChild(totalSize);
            permission.appendChild(usedSize);
            controller.insertBefore(btn2, otherBtn);

            //----------------- add File ---------------------
            const dialogBoxBackground = document.createElement("div");
            dialogBoxBackground.setAttribute(
                "data-fm-fileDialogBox",
                "background"
            );
            dialogBoxBackground.setAttribute("data-fm-display", "none");

            const dialogBoxContainer = document.createElement("div");
            dialogBoxContainer.setAttribute(
                "data-fm-fileDialogBox",
                "container"
            );

            const dialogBox = document.createElement("div");
            dialogBox.setAttribute("data-fm-dialogBox", "addFile");

            const closeDialogBox = document.createElement("div");
            closeDialogBox.setAttribute("data-fm-fileDialogBox", "closeBox");

            const close = document.createElement("div");
            close.setAttribute("data-fm-fileDialogBox", "close");
            close.append("X");

            closeDialogBox.appendChild(close);

            const uploadForm = document.createElement("form");
            uploadForm.setAttribute("data-fm-dialogBox-form", "uploadFile");

            const formInput = document.createElement("input");
            formInput.setAttribute("data-fm-input", "file");
            formInput.setAttribute("type", "file");
            formInput.setAttribute("name", "myFiles");
            formInput.setAttribute("multiple", "multiple");

            const uploadBtn = document.createElement("button");
            uploadBtn.setAttribute("data-fm-dialogBox-btn", "addFile");
            uploadBtn.append(this.owner.culture.uploadBtn);

            dialogBox.appendChild(uploadForm);
            uploadForm.appendChild(formInput);
            uploadForm.appendChild(uploadBtn);
            dialogBox.appendChild(closeDialogBox);
            dialogBoxContainer.appendChild(dialogBox);
            dialogBox.appendChild(uploadForm);

            this.container.appendChild(dialogBoxBackground);
            this.container.appendChild(dialogBoxContainer);
        }
        
    }
    public nodeAdded(node: IFileHierarchyNode): void {
        if (this.activeNode == node.parent) {
            this.container.querySelector('[data-fm-view="view"]').innerHTML =
                "";
            if (this.owner.userSetting.viewMode == "grid") {
                this.renderGrid(this.activeNode);
            } else {
                this.renderTile(this.activeNode);
            }
        }
    }

    private renderGrid(node: IFileHierarchyNode): void {
        this.container.querySelector('[data-fm-view="view"]').innerHTML = "";
        const table = document.createElement("table");
        const thead = document.createElement("thead");

        this.owner.options.gridViewFields.forEach((object) => {
            const td = document.createElement("th");
            td.setAttribute("class", "textCenter");
            let colName = document.createTextNode(object.title);
            td.setAttribute("width", "15%");
            td.setAttribute("align", "right");
            td.appendChild(colName);
            thead.appendChild(td);
        });

        table.appendChild(thead);

        const mimeField = this.owner.options.mimeField;
        const mimeIcon = IconImageMaker.Current;

        node.childs.forEach((node) => {
            const tr = document.createElement("tr");
            const mime = Reflect.get(node.data, mimeField);
            this.owner.options.gridViewFields.forEach((object) => {
                const td = document.createElement("td");
                td.setAttribute("class", "textCenter");
                const field = Reflect.get(node.data, object.fieldName);
                const colValue = field
                    ? document.createTextNode(field)
                    : document.createTextNode("-");

                if (object.fieldName == this.owner.options.titleField) {
                    const titleField = document.createElement("span");
                    titleField.setAttribute("data-fm-view-field", "title");
                    titleField.appendChild(colValue);

                    td.setAttribute("class", "textLeft");
                    td.appendChild(mimeIcon.getMIMEImage(mime, 32));
                    td.appendChild(titleField);

                    if (node.isFolder) {
                        titleField?.addEventListener("dblclick", (e) => {
                            this.owner.updateUI(node);
                        });
                    }
                } else if (object.fieldName == this.owner.options.urlField) {
                    if (!node.isFolder) {
                        const download = document.createElement("a");
                        download.setAttribute("data-fm-view-download", "icon");
                        download.setAttribute(
                            "href",
                            `/${colValue.textContent}`
                        );
                        td.appendChild(download);
                    }
                } else {
                    td.appendChild(colValue);
                }
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        this.container
            .querySelector("[data-fm-view='view']")
            .appendChild(table);
    }

    private renderTile(node: IFileHierarchyNode): void {
        this.container.querySelector('[data-fm-view="view"]').innerHTML = "";
        const mimeField = this.owner.options.mimeField;
        const mimeIcon = IconImageMaker.Current;

        const div = document.createElement("div");

        node.childs.forEach((node) => {
            const items = document.createElement("div");
            items.setAttribute("data-fm-view", "items");
            const mime = Reflect.get(node.data, mimeField);
            items.appendChild(mimeIcon.getMIMEImage(mime, 64));

            this.owner.options.tileViewFields.forEach((object) => {
                const item = document.createElement("div");
                item.setAttribute(
                    `data-fm-view-${object.fieldName}`,
                    object.fieldName
                );
                const field = Reflect.get(node.data, object.fieldName);
                const colValue = field
                    ? document.createTextNode(field)
                    : document.createTextNode("");
                if (object.fieldName == this.owner.options.urlField) {
                    if (!node.isFolder) {
                        const download = document.createElement("a");
                        download.setAttribute("data-fm-view-download", "icon");
                        download.setAttribute(
                            "href",
                            `/${colValue.textContent}`
                        );
                        item.appendChild(download);
                    }
                } else if (object.fieldName == this.owner.options.sizeField) {
                    if (!node.isFolder) {
                        const size = document.createElement("span");
                        size.append(
                            `${this.owner.culture.fileSizeTitle} :${colValue.textContent} KB`
                        );
                        size.setAttribute("data-fm-view-size", "text");
                        item.appendChild(size);
                    }
                } else {
                    item.appendChild(colValue);
                }

                items.appendChild(item);
            });
            if (node.isFolder) {
                items.addEventListener("dblclick", (e) => {
                    this.owner.updateUI(node);
                });
            }
            div.appendChild(items);
        });
        this.container.querySelector('[data-fm-view="view"]')?.appendChild(div);
    }

    private closeCreateFolderPopup(){
        (this.container.querySelector('[data-fm-folderDialogBox="background"]') as HTMLElement).style.display='none';
            (this.container.querySelector('[data-fm-folderDialogBox="container"]') as HTMLElement).style.display='none';
            
            this.folderName.value='';
            this.folderDesc.value='';
    }
    private closeUploadFilePopup(){
        (this.container.querySelector('[data-fm-fileDialogBox="background"]') as HTMLElement).style.display='none';
            (this.container.querySelector('[data-fm-fileDialogBox="container"]') as HTMLElement).style.display='none';
            
            this.file.value='';
    }

    private addingHandler():void{
        const viewTypes:ViewMode[]=['tile','grid']

        viewTypes.forEach(viewType=>{
            this.container.querySelector(`[data-fm-view-mode="${viewType}"]`).addEventListener('click', _=>{
                if (this.owner.userSetting.viewMode!=viewType){
                    this.owner.userSetting.viewMode=viewType;
                    (viewType=='grid')?this.renderGrid(this.activeNode):this.renderTile(this.activeNode);  
                }
            })
        })

        //------------------------------------- create Folder ----------------------------------------
        this.container.querySelector('[data-fm-view-add="folder"]')?.addEventListener('click', _=>{
            (this.container.querySelector('[data-fm-folderDialogBox="background"]') as HTMLElement).style.display='block';
            (this.container.querySelector('[data-fm-folderDialogBox="container"]') as HTMLElement).style.display='block';
        })
        
        this.container.querySelector('[data-fm-dialogBox-btn="createFolder"]')?.addEventListener('click', e=>{

            if (this.folderName.value!=''){
                const newFolder:IFolderInfo={
                    title: this.folderName.value,
                    description: this.folderDesc.value
                }
                this.owner.addFolder(newFolder);
            }
            e.preventDefault();
            this.closeCreateFolderPopup();

        })
        this.container.querySelector('[data-fm-folderDialogBox="close"]')?.addEventListener('click', _=>{
            this.closeCreateFolderPopup();
        })

        //------------------------------------------- upload File ----------------------------------------
        this.container.querySelector('[data-fm-view-add="file"]')?.addEventListener('click',e=>{
            (this.container.querySelector('[data-fm-fileDialogBox="background"]') as HTMLElement).style.display='block';
            (this.container.querySelector('[data-fm-fileDialogBox="container"]') as HTMLElement).style.display='block';
        })

        this.container.querySelector('[data-fm-dialogBox-btn="addFile"]')?.addEventListener('click', (e) => {
            e.preventDefault()
            let filesList :File[]=[];
            const files = this.file.files

            for (let file of files) {
                filesList.push(file);
            };
            this.closeUploadFilePopup();
            this.owner.addFiles(filesList);  

        });

        this.container.querySelector('[data-fm-fileDialogBox="close"]')?.addEventListener('click',e=>{
            this.closeUploadFilePopup();
        })

        //----------------------------------------- sync data ----------------------------------------
        this.container.querySelector('[data-fm-view-sync="data"]').addEventListener('click', _=>{
            this.owner.syncDataAsync();
        })
    }
    public updateUI(node: IFileHierarchyNode): void { 
        if (node!=this.activeNode){
            if (node.isFolder==false){
                node=node.parent;
            }
            this.activeNode=node;
            if (this.owner.userSetting.viewMode=="grid"){
                this.renderGrid(this.activeNode);
            }
            else{
                this.renderTile(this.activeNode);
            }
            
        }
    }
}
