import {Store} from "../../../Annotator/Store/Store";
import {DataSource} from "../../../Annotator/Store/DataSource";
import {Label} from "../../../Annotator/Store/Label";
import {AddLabelAction} from "../../../Annotator/Action/AddLabel";
import {expect} from "chai";
import {Connection} from "../../../Annotator/Store/Connection";

class StubDataSource implements DataSource {
    getLabels(): Array<Label> {
        return [];
    }

    getRawContent(): string {
        return "\n\n  测试。\n\n" +
            "  测试 。  测试，测试？！  ？ ！   测试测试\n" +
            "测试 \n" +
            "测试测试  \n";
    }

    addLabel(label: Label) {
    }

    requireLabelText(): Promise<string> {
        return new Promise<string>((resolve, _) => {
            resolve('测试');
        });
    }

    getConnections(): Array<Connection> {
        return [];
    }

    requireConnectionText(): Promise<string> {
        return new Promise<string>((resolve, _) => {
            resolve('测试');
        });
    }

}

describe('Store能正确地响应Action', () => {
    let store = new Store(new StubDataSource());
    it('在添加跨段标注时正确地响应了', () => {
        AddLabelAction.emit(6, 13);
        let paragraphs = store.children.map(it => it.toString());
        expect(paragraphs).not.include("测试。");
        expect(paragraphs).not.include("测试 。  测试，测试？！  ？ ！   测试测试");
        expect(paragraphs).include("测试。\n\n  测试 。  测试，测试？！  ？ ！   测试测试");
        expect(paragraphs).include("测试测试");
    });
});