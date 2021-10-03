import IFileHierarchyNode from "../Interface/IFileHierarchyNode";
import IUserPermission from "../Interface/IUserPermission";
import ICulture from "../Interface/ICulture";
import IComponent from "../Interface/IComponent";
import IFileManagerOptions from "../Interface/IFileManagerOptions";
import IHierarchyNode from "../Interface/IHierarchyNode";
import IAddFileResult from "../Interface/IAddFileResult";
import IFolderInfo from "../Interface/IFolderInfo";
import IFileInfo from "../Interface/IFileInfo";
import TreeComponent from "../Tree/tree";
import ViewComponent from "../View/view";
import PathComponent from "../path/path";
import { IUserSetting } from "../Interface/types";

import "../../assets/style.css"

export default class FileManagerComponent {
    protected readonly container: HTMLElement;
    private readonly components: IComponent[];

    nodes: IFileHierarchyNode;
    options: IFileManagerOptions;
    userSetting: IUserSetting;
    userPermission: IUserPermission;
    culture: ICulture;
    private activeNode: IFileHierarchyNode;
    private userHistory: IFileHierarchyNode[] = [];
    private historyCurrentIndex: number = 0;
    private nextKey: Element;
    private prevKey: Element;
    api:{nodesApi: string};

    private constructor(container: HTMLElement,options: IFileManagerOptions,api?: {nodesApi: string}) {
        this.container = container;
        this.options = options;
        this.culture = options.culture;
        this.api=api;

        const [treeContainer,viewContainer,pathContainer]=FileManagerComponent.initialize(container);
        this.components = [new TreeComponent(treeContainer,this), new PathComponent(pathContainer,this), new ViewComponent(viewContainer,this)]
        
        this.nextKey=this.container.querySelector('[data-fm-arrowKey="next"]')
        this.prevKey=this.container.querySelector('[data-fm-arrowKey="prev"]')
        this.addingHandler();
    }

    async getPermission(): Promise<void> {
        const userPermission = this.requestJsonAsync(
            this.options.api.userPermissionApi,
            "POST",
            {
                userid: 123
            }
        );
        this.userPermission = await userPermission;
        return Promise.resolve();
    }

    async getSetting(): Promise<void> {
        
        const userSetting =this.requestJsonAsync(
            this.options.api.userSettingApi,
            "POST",
            {
                userid: 123
            }
        );
        console.log(userSetting);
        // const userSetting : IUserSetting = {
        //     viewMode: "grid",
        //   }
        this.userSetting =  await userSetting;
        return Promise.resolve();
    }

    async initializeAsync(): Promise<void> {
        const getNodeTask = this.requestJsonAsync(
            this.api.nodesApi,
            "POST",
            {
                userid: 123
            }
        );
        const getPermissionTask = this.getPermission();
        const getSettingTask = this.getSetting();
        const nodes = await getNodeTask;
        this.nodes = FileManagerComponent.toFileHierarchyNode(nodes);
        this.activeNode = this.nodes;
        this.userHistory.push(this.nodes);
        await getPermissionTask;
        await getSettingTask;
        
        this.components.forEach((e) => e.initialize());
    }

    private static initialize(container: HTMLElement): HTMLElement[] {
        const treeContainer = document.createElement("div");
        treeContainer.setAttribute("data-fm-tree", "tree");

        const bodyContainer = document.createElement("div");
        bodyContainer.setAttribute("data-fm-container", "container");

        const containerClr = document.createElement("div");
        containerClr.setAttribute("class", "clr");

        container.appendChild(treeContainer);
        container.appendChild(bodyContainer);
        container.appendChild(containerClr);

        const pathClr = document.createElement("div");
        pathClr.setAttribute("class", "clr");
        const hr = document.createElement("hr");

        const topController = document.createElement("div");
        topController.setAttribute("data-fm-controller", "body");

        const Controller = document.createElement("div");
        Controller.setAttribute("data-fm-controller", "arrowKey");

        const next = document.createElement("button");
        next.setAttribute("data-fm-arrowKey", "next");
        next.setAttribute("disabled", "disabled");
        next.append(">");

        const prev = document.createElement("button");
        prev.setAttribute("data-fm-arrowKey", "prev");
        prev.setAttribute("disabled", "disabled");
        prev.append("<");

        Controller.appendChild(prev);
        Controller.appendChild(next);

        const pathContainer = document.createElement("div");
        pathContainer.setAttribute("data-fm-path", "path");

        topController.appendChild(Controller);
        topController.appendChild(pathContainer);
        topController.appendChild(pathClr);

        bodyContainer.appendChild(topController);
        bodyContainer.appendChild(hr);

        const viewContainer = document.createElement("div");
        viewContainer.setAttribute("data-fm-view", "content");

        bodyContainer.appendChild(viewContainer);

        return [treeContainer, viewContainer, pathContainer];
    }

    private static toFileHierarchyNode(nodes: IHierarchyNode): IFileHierarchyNode { 
        const convertorFunction: (parent: IFileHierarchyNode,node: IHierarchyNode) => IFileHierarchyNode = function (parent, node) {
            const retVal: IFileHierarchyNode = {
                parent: parent,
                data: node.data,
                childs: null,
                isFolder:node.childs?true:false
            };
            if(node.childs ){
                retVal.childs = node?.childs.map((x) => convertorFunction(retVal, x));
            }
            return retVal;
            };
            return convertorFunction(null,nodes);
    }
    
    public addFiles(files: File[]): IAddFileResult[] {
        let result : IAddFileResult[]=[]; 
        for (let file of files){
            
            const fileInfo:IFileInfo={
            file:file,
            };
            Reflect.set(fileInfo,this.options.titleField,file.name);
            Reflect.set(fileInfo,this.options.mimeField,file.type);
            Reflect.set(fileInfo,this.options.sizeField,file.size);
            const mime=file.type;
            const size=file.size;
            const name=file.name;

            const retVal: IAddFileResult={
                source: name,
                hasError: false,
                message: ''
            }
            const userPermit=this.userPermission.mimePermission.find(item => item.mime === mime)
            if(userPermit){
                if (userPermit.size>=size){
                    const result = this.addNode(fileInfo,false);
                    retVal.message = result.message;
                    retVal.hasError = result.hasError;
                }
                else{
                    retVal.message = 'size error'
                    retVal.hasError = true ;
                }
            }
            else{
                retVal.message = 'mime error';
                retVal.hasError = true ;
            }
            result.push(retVal);
        }
        
        return result;
        
    }

    public addFolder(folder: IFolderInfo): IAddFileResult{
        return this.addNode(folder,true);
    }

    private addNode(object:IFolderInfo | IFileInfo , isFolder : boolean):IAddFileResult{
        const node=this.activeNode.isFolder?this.activeNode:this.activeNode.parent;
        const titleField=this.options.titleField
        const duplicateNode=node.childs.find(item => Reflect.get(item.data, titleField) == Reflect.get(object, titleField))
        const result: IAddFileResult={
            source: Reflect.get(object, titleField),
            hasError: false,
            message: ''
        }
        if(duplicateNode){
            result.message = 'duplicate file or folder'
            result.hasError = true
        }
        else{
            const newNode: IFileHierarchyNode = {
                parent: node,
                data: object,
                childs: isFolder?[]:null,
                isFolder:isFolder
            };
            
            node.childs.push(newNode);
            this.components.forEach(x =>{
                try{ x.nodeAdded(newNode);}
                catch (e){ console.error(`Error in run nodeAdded for ${x}`,e);}
            });
                result.message = 'file or folder added';
                result.hasError = false;
        }
        
        return result
    }
    public async syncDataAsync(): Promise<[]> {
        const node = this.nodes;
        const keyField=this.options.keyField;
        const clientNodes: IFileHierarchyNode[] = [];
        this.findClientNodes(node, clientNodes);
        const serverNodeFunctionAsync: (parent: IFileHierarchyNode,node: IFileHierarchyNode) => Promise<IFileHierarchyNode> = async function (parent, node) {
            const retVal: IFileHierarchyNode = {
            data: node.data,
            parent: Reflect.get(node.parent.data,keyField),
            childs: node.childs,
            isFolder: node.isFolder,
            };
            
        const file = node.data.file;
        if (file) {
            const readFileContentTask = new Promise<ArrayBuffer>((resolve) => {
                const fileReader = new FileReader();
                fileReader.onload = function (evt) {
                    resolve(evt.target.result as ArrayBuffer);
                };
                fileReader.readAsDataURL(file);
            });
            retVal.data.fileContent = await readFileContentTask;
            delete retVal.data.file;
        } else {
            if (node.childs) {
                const tasks = node?.childs.map(async (childNode) =>
                serverNodeFunctionAsync(retVal, childNode)
                );
                retVal.childs = await Promise.all(tasks);
            }
          }
          return retVal;
        };
        const task = clientNodes.map(async (e) => serverNodeFunctionAsync(null, e));
        const result = await Promise.all(task);
        var objToString = JSON.stringify(result)
        console.log(objToString );
        return [];
      }

    private findClientNodes(node : IFileHierarchyNode, clientNodes:IFileHierarchyNode[]){
        const keyField=this.options.keyField;

        if(!Reflect.get(node.data, keyField)){
            clientNodes.push(node);
        }
        if (node.childs){
            node.childs.forEach(child=>{
                this.findClientNodes(child,clientNodes)
            })
        }
    }
    public updateUI(node: IFileHierarchyNode): void {

        if (this.activeNode!=node){
            //------------------- remove from userHistory --------------------
            const userHistoryLength=this.userHistory.length
            if (this.historyCurrentIndex<userHistoryLength-1){
                this.userHistory.splice(this.historyCurrentIndex+1,userHistoryLength-this.historyCurrentIndex);
            }

            this.userHistory.push(node);
            this.historyCurrentIndex=this.userHistory.length-1;
            this.activeNode=node;
            this.components.forEach(x =>{
                try{ x.updateUI(node);}
                catch (e){ console.error(`Error in updateUI for ${x}`,e);}
            });

            //--------------------- Enable prev button -----------------------
            const activePrev=this.prevKey.getAttribute('disabled')

            if(this.userHistory.length>1 && activePrev=='disabled'){
                this.prevKey.removeAttribute('disabled');
            }
        }
    }

    public browseHistory(arrow:string): void {
        const arrowIndex=(arrow=='prev')?1:-1;
        this.historyCurrentIndex=this.historyCurrentIndex-arrowIndex
        this.activeNode=this.userHistory[this.historyCurrentIndex];

        this.components.forEach(x =>{
            try{ x.updateUI(this.activeNode);}
            catch (e){ console.error(`Error in updateUI for ${x}`,e);}
        });

        //--------------------- Enable next button -----------------------
        const activeNext=this.nextKey.getAttribute('disabled')

        if(this.userHistory.length>1 && this.historyCurrentIndex!=this.userHistory.length-1 && activeNext=='disabled'){
            this.nextKey.removeAttribute('disabled');
        }
    }

    private addingHandler(){
        this.prevKey?.addEventListener('click',_=>{
            const currentIndex=this.historyCurrentIndex
            if (currentIndex>0){
                this.browseHistory('prev');
            }
            if(currentIndex==1){
                this.prevKey.setAttribute('disabled','disabled');
            }
        })

        this.nextKey?.addEventListener('click',_=>{
            const currentIndex=this.historyCurrentIndex
            if (currentIndex<this.userHistory.length-1){
                this.browseHistory('next');
            }
            if(currentIndex+1==this.userHistory.length-1){
                this.nextKey.setAttribute('disabled','disabled');
            }
        })
    }

    async requestJsonAsync(
        url: string,
        method: "POST" | "GET" = "GET",
        params?: any
    ): Promise<any> {
        const init: any = {
            method: method,
        };
        if (params) {
            const form = new FormData();

            for (const key in params) {
                form.append(key, Reflect.get(params, key));
            }
            init.body = form;
        }
        const response = await fetch(url, init);
        const result = await response.json();
        return result;
    }

    static async createFileManagerAsync(
        container: HTMLElement,
        options: IFileManagerOptions,
    ): Promise<FileManagerComponent> {

        const api = { nodesApi: "server/nodes" }
        const retVal = new FileManagerComponent(container,options,options.api?options.api:api);
        await retVal.initializeAsync();
        return retVal;
    }
}
