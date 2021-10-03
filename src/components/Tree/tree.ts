import IFileHierarchyNode from "../Interface/IFileHierarchyNode";
import IComponent from "../Interface/IComponent";
import FileManagerComponent from "../FileManager/FileManager";

export default class TreeComponent implements IComponent {
    private readonly container: Element;
    private activeNode: IFileHierarchyNode;
    private activeElement: Element;
    private readonly owner: FileManagerComponent;
    private map: Map<Element, IFileHierarchyNode>;

    constructor(container: Element, owner: FileManagerComponent) {
        this.container = container;
        this.owner = owner;
        this.map = new Map<Element, IFileHierarchyNode>();
    }

    initialize(): void {
        const renderResult = this.render(this.owner.nodes);
        const ul = document.createElement("ul");
        ul.setAttribute("data-fm-tree-ul", "");
        this.container?.appendChild(ul).appendChild(renderResult);
        this.activeElement = this.container.querySelectorAll(
            '[data-fm-tree="title"]'
        )[0];

        this.updateUI(this.owner.nodes);
        this.addingHandler();
    }

    public nodeAdded(node: IFileHierarchyNode): void {
        const parent = Array.from(this.map.entries()).find(
            (x) => x[1] == node.parent
        );
        const li = document.createElement("li");

        li.appendChild(this.renderLevel(node));
        const element = li.querySelectorAll('[data-fm-tree="title"]')[0];
        this.map.set(element, node);

        element.addEventListener("click", (event) => {
            event.stopPropagation();
            this.owner.updateUI(this.map.get(element));
        });

        if (node.isFolder == true) {
            const ul = document.createElement("ul");
            ul.setAttribute("data-fm-tree-isExpand", "true");
            ul.setAttribute("data-fm-tree-childs", "");
            li.appendChild(ul);
        }
        const childParent =
            parent[0].parentElement.parentElement.querySelectorAll(
                "[data-fm-tree-childs]"
            )[0];
        childParent.appendChild(li);
    }

    private renderLevel(node: IFileHierarchyNode): Node {
        const expand = document.createElement("span");
        let content = document.createElement("span");
        content.setAttribute("data-fm-tree", "title");
        if (node.childs != null) {
            expand.append("-");
            expand.setAttribute("data-fm-tree", "expand");
        }

        let title = document.createTextNode(
            Reflect.get(node.data, this.owner.options.titleField)
        );
        content.appendChild(title);

        const row = document.createElement("div");
        row.setAttribute("data-fm-tree-row", "");
        row.appendChild(expand);
        row.insertBefore(content, expand.nextSibling);

        return row;
    }
    private render(node: IFileHierarchyNode): Element {
        const li = document.createElement("li");

        li.appendChild(this.renderLevel(node));
        this.map.set(li.querySelectorAll('[data-fm-tree="title"]')[0], node);

        if (node.childs) {
            const ul = document.createElement("ul");
            ul.setAttribute("data-fm-tree-isExpand", "true");
            ul.setAttribute("data-fm-tree-childs", "");
            li.appendChild(ul);

            node.childs.forEach((nodeChild) => {
                ul.appendChild(this.render(nodeChild));
            });
        }
        return li;
    }
    private addingHandler(): void {
        this.container
            .querySelectorAll('[data-fm-tree="expand"]')
            .forEach((item) => {
                item.addEventListener("click", (_) => {
                    const child = item.parentElement
                        .closest("li")
                        .querySelectorAll("ul")[0];
                    this.slideToggle(item, child);
                });
            });

        this.container
            .querySelectorAll('[data-fm-tree="title"]')
            .forEach((item) => {
                item.addEventListener("click", (event) => {
                    event.stopPropagation();
                    this.owner.updateUI(this.map.get(item));
                });
            });
    }
    public updateUI(node: IFileHierarchyNode): void {
        if (node != this.activeNode) {
            const result = Array.from(this.map.entries()).find((x) => x[1] == node);
            if (result) {
                this.activeNode = node;
                this.activeElement?.removeAttribute("data-fm-tree-isSelected");
                this.activeElement = result[0];
                this.activeElement.setAttribute(
                    "data-fm-tree-isSelected",
                    "true"
                );
            }
        }
    }
    private slideToggle(expandIcon: Element, parent: HTMLElement): void {
        if (parent.getAttribute("data-fm-tree-isExpand") == "false") {
            expandIcon.innerHTML = "-";
            parent.setAttribute("data-fm-tree-isExpand", "true");
            parent.style.display = "block";
        } else {
            expandIcon.innerHTML = "+";
            parent.setAttribute("data-fm-tree-isExpand", "false");
            parent.style.display = "none";
        }
    }
}
