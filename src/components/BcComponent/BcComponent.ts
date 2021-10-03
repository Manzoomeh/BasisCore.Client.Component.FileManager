import IComponentManager from "../../basisCore/IComponentManager";
import ISource from "../../basisCore/ISource";
import IUserDefineComponent from "../../basisCore/IUserDefineComponent";
import FileManagerComponent from "../FileManager/FileManager";
import IFileManagerOptions from "../Interface/IFileManagerOptions";

export default class BcComponent implements IComponentManager {
  readonly owner: IUserDefineComponent;
  private fileManager: FileManagerComponent;
  private readonly container: HTMLElement;
  private options: IFileManagerOptions;


  constructor(owner: IUserDefineComponent) {
    this.owner = owner;
    this.container = document.createElement('div');
    this.container.setAttribute("data-fm-id","main")
    
    this.owner.setContent(this.container);
  }

  public async initializeAsync(): Promise<void> {

    const options=eval(await this.owner.getAttributeValueAsync("fm-options")) as IFileManagerOptions
    this.options = options 

    this.fileManager=await FileManagerComponent.createFileManagerAsync(this.container,this.options);
  }

  public async runAsync(source?: ISource): Promise<boolean> {
    return true;
  }
}
