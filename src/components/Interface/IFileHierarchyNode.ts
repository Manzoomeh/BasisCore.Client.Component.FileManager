
import IHierarchyNode from "./IHierarchyNode";

export default interface IFileHierarchyNode extends IHierarchyNode {
    data: any;
    parent: IFileHierarchyNode;
    childs?: Array<IFileHierarchyNode>;
    isFolder:boolean;
}