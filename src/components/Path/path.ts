import IFileHierarchyNode from "../Interface/IFileHierarchyNode";
import FileManagerComponent from "../../components/FileManager/FileManager";
import IComponent from "../Interface/IComponent";

export default class PathComponent implements IComponent {
    private readonly container: HTMLElement;
    private activeNode: IFileHierarchyNode;
    private readonly owner: FileManagerComponent;

    constructor(container: HTMLElement, owner: FileManagerComponent) {
        this.owner = owner;
        this.container = container;
        
    }
    initialize(): void {
        this.initializeUI();
        this.updateUI(this.owner.nodes);
    }
    private initializeUI() {
        const div = document.createElement("div");
        div.setAttribute("data-fm-path", "startPath");
        div.append(this.owner.culture.pathTitle);
        this.container.appendChild(div);
    }

    public nodeAdded(node: IFileHierarchyNode): void {}
    public updateUI(node: IFileHierarchyNode): void {
        if (this.activeNode != node) {
            this.activeNode = node;
            this.container.querySelectorAll('[data-fm-path="splitter"],[data-fm-path="node"]')?.forEach((e) => {
                    e.remove();
                });

            let current = node;
            while (current) {
                const localCurrent = current;
                const path = this.container.querySelector('[data-fm-path="startPath"]');

                const splitterTag = document.createElement("span");
                splitterTag.setAttribute("data-fm-path", "splitter");
                splitterTag.textContent = "/";

                const nodeTag = document.createElement("span");
                nodeTag.setAttribute("data-fm-path", "node");
                nodeTag.textContent = Reflect.get(localCurrent.data,this.owner.options.titleField);

                this.container.insertBefore(nodeTag, path.nextSibling);
                this.container.insertBefore(splitterTag, path.nextSibling);

                nodeTag.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.owner.updateUI(localCurrent);
                });

                current = localCurrent.parent;
            }
        }
    }
}

