/**
 * Created by grzhan on 16/7/1.
 */
/// <reference path="../typings/svgjs.d.ts" />

import {Util} from './util/Util';

export class Draw {
    private board;
    private  margin = 10;
    private  lineHeight = 30;
    private shoulder = 20;
    private needExtend = false;
    private style_user_select_none = {
        'style': '-webkit-user-select: none; user-select:none; -khtml-user-select:none;-ms-user-select:none;-moz-user-select:none; cursor: default;'
    };
    constructor(board) {
        this.board = board;
    }

    public highlight(selector, color='#e8fbe8') {
        let {width, height, left, top} = selector;
        return this.board.group['highlight'].rect(width, height).move(left, top).attr({fill: color});
    }
    
    public textline(lineNo, content, left, top) {
        return this.board.group['text'].text(content).attr({'data-id': `text-line-${lineNo}`}).move(left, top).font({size: 14});
    }

    public annotation(id, cid, selector) {
        this.needExtend = false;
        let margin = this.margin;
        let lineNo = selector.lineNo;
        let content = this.board.category[cid - 1]['text'];
        let textDef = this.board.group['shadow'].text(content).size(12);
        let width = Util.width(textDef.node);
        let height = Util.height(textDef.node);
        let left = selector.left + selector.width / 2 - width / 2;
        let top = this.calcAnnotationTop(textDef, selector);
        let text = this.board.svg.text(content).size(12).move(left, top).attr(this.style_user_select_none);
        textDef.remove();
        let fillColor = this.board.category[cid -1]['fill'];
        let strokeColor = this.board.category[cid -1]['boader'];
        let rect = this.board.svg.rect(width + 4, height + 4).move(left - 2 , top - 2).fill(fillColor).stroke(strokeColor).radius(2).attr({'data-id': `label-${id}`});
        let annotateGroup = this.board.svg.group();
        let bHeight = margin - 2;
        let bTop = top + rect.height() - 2;
        let bracket = this.bracket(cid, selector.left, bTop, selector.left + selector.width, bTop, bHeight);
        annotateGroup.add(rect);
        annotateGroup.add(text);
        annotateGroup.add(bracket);
        this.board.labelsSVG[id] = {rect, lineNo};
        this.board.lines['annotation'][lineNo - 1].push(annotateGroup);
        if (this.needExtend) {
            this.extendAnnotationLine(lineNo, 'label');
        }
        if (left < 2)
            this.moveLineRight(lineNo, -left+2);
    }
    
    public label(id, cid, selector) {
        let extendHeight = 0;
        let lineNo = selector.lineNo;
        let {width, height, left, top} = selector;
        if (this.board.lines.annotation[lineNo - 1].length < 1 && this.board.visible['label']) {
            selector.top +=  this.extendAnnotationLine(lineNo, 'label');
        }
        if (this.board.visible['highlight']) {
            let highlight = this.highlight(selector, this.board.category[cid - 1]['highlight']);
            this.board.lines['highlight'][lineNo - 1].push(highlight);
        }
        if (this.board.visible['label'])
            this.annotation(id, cid, selector);
    }

    public relation(srcId, dstId, text='body location of') {
        if (!this.board.visible['relation']) return;
        this.needExtend = false;
        // let content = this.board.lcategory[cid - 1]['text'];
        let content = text;
        let textDef = this.board.group['shadow'].text(content).size(12).attr(this.style_user_select_none);
        let width = Util.width(textDef.node);
        let height = Util.height(textDef.node);
        let src = this.board.labelsSVG[srcId].rect;
        let dst = this.board.labelsSVG[dstId].rect;
        let lineNo = Math.max(this.board.labelsSVG[dstId].lineNo, this.board.labelsSVG[srcId].lineNo);
        let srcX = src.x() + src.parent().transform()['x'];
        let srcY = src.y() + src.parent().transform()['y'];
        let dstX = dst.x() + dst.parent().transform()['x'];
        let dstY = dst.y() + dst.parent().transform()['y'];
        let distance = srcX < dstX ? dstX + dst.width() - srcX : srcX + src.width() - dstX;
        let left = srcX < dstX ? (srcX + dstX + dst.width() - width) / 2 : (dstX + srcX + src.width() - width) / 2;
        let deltaY = srcY < dstY ? 0 : srcY - dstY;
        let x0 = srcX < dstX ? srcX : srcX + src.width();
        let y0 = srcY + src.height() / 2;
        let shoulder = this.shoulder;
        let cx1 = srcX < dstX ? x0 - shoulder : x0 + shoulder;
        let top = this.calcRelationTop(lineNo, width, height, y0 - (this.margin + height + deltaY), left);
        let cy1 = top + height / 2;
        let x1 = x0;
        let y1 = cy1;
        let x2 = srcX < dstX ? dstX + dst.width() + shoulder / 2 : dstX - shoulder / 2;
        let cx2 = srcX < dstX ? x2 + shoulder / 2 : x2 - shoulder / 2;
        let cy2 = y1;
        let x3 = srcX < dstX ? dstX + dst.width() : dstX;
        let y3 = dstY - 2;
        if (distance < width) {
            cx1 = srcX < dstX ? left - shoulder : left + width + shoulder;
            x1 = srcX < dstX ? left - shoulder / 2 : left + width + shoulder / 2;
            x2 = srcX < dstX ? left + width + shoulder / 2 : left - shoulder /2;
            cx2 = srcX < dstX ? x2 + shoulder / 2 : x2 - shoulder /2;
        }
        let group = this.board.group['relation'].group();
        let path = group.path(`M${x0} ${y0}Q${cx1} ${cy1} ${x1} ${y1} H${x2} Q${cx2} ${cy2} ${x3} ${y3}`)
            .fill('none').stroke({color: '#000'});
        path.marker('end', 5,5, add => {
            add.polyline('0,0 5,2.5 0,5 0.2,2.5');
        });
        group.rect(width + 4, height).move(left - 2, top).fill('#fff');
        group.text(content).size(12).move(left, top);
        textDef.remove();
        this.board.lines['relation'][lineNo - 1].push(group);
        if (this.needExtend) {
            this.extendAnnotationLine(lineNo, 'relation');
        }
        let leftEdge = Math.min(srcX, dstX, x0, x1, x2, x3, cx1, cx2, left);
        if (leftEdge < 0) {
            let lineNo = Math.min(this.board.labelsSVG[dstId].lineNo, this.board.labelsSVG[srcId].lineNo);
            this.moveLineRight(lineNo, -leftEdge);
        }
    }

    public underscore(paragraph) {
        let startLine = paragraph.startLine;
        let startOffset = paragraph.startOffset;
        let endLine = paragraph.endLine;
        let endOffset = paragraph.endOffset;
        if (startLine == endOffset) {
            this.underscoreLine(startLine, startOffset, -1);
            for (let i=startLine + 1; i=endLine - 1; i++) {
                this.underscoreLine(i, 0, -1);
            }
            this.underscoreLine(endLine, 0, endOffset);
        } else {
            this.underscoreLine(startLine, startOffset, endOffset);
        }
    }

    // Thanks to Alex Hornbake (function for generate curly bracket path)
    // http://bl.ocks.org/alexhornbake/6005176
    public bracket(cid, x1,y1,x2,y2,width,q=0.6) {
        //Calculate unit vector
        let dx = x1-x2;
        let dy = y1-y2;
        let len = Math.sqrt(dx*dx + dy*dy);
        dx = dx / len;
        dy = dy / len;

        //Calculate Control Points of path,
        let qx1 = x1 + q*width*dy;
        let qy1 = y1 - q*width*dx;
        let qx2 = (x1 - .25*len*dx) + (1-q)*width*dy;
        let qy2 = (y1 - .25*len*dy) - (1-q)*width*dx;
        let tx1 = (x1 -  .5*len*dx) + width*dy;
        let ty1 = (y1 -  .5*len*dy) - width*dx;
        let qx3 = x2 + q*width*dy;
        let qy3 = y2 - q*width*dx;
        let qx4 = (x1 - .75*len*dx) + (1-q)*width*dy;
        let qy4 = (y1 - .75*len*dy) - (1-q)*width*dx;
        return this.board.svg.path(`M${x1},${y1}Q${qx1},${qy1},${qx2},${qy2}T${tx1},${ty1}M${x2},${y2}Q${qx3},${qy3},${qx4},${qy4}T${tx1},${ty1}`)
            .fill('none').stroke({ color: this.board.category[cid - 1]['boader'], width: 0.5}).transform({rotation: 180});
    }

    private moveLineRight(lineNo, padding) {
        let textline = this.board.lines['text'][lineNo - 1];
        let highlights = this.board.lines['highlight'][lineNo -1];
        let annotations = this.board.lines['annotation'][lineNo -1];
        let relations = this.board.lines['relation'][lineNo - 1];
        textline.dx(padding);
        let maxWidth = textline.x();
        if (highlights) {
            for (let highlight of highlights) {
                highlight.dx(padding);
                if (maxWidth < highlight.x()) maxWidth = highlight.x();
            }
        }
        if (annotations) {
            for (let annotation of annotations) {
                let {x} = annotation.transform();
                annotation.transform({x: x+padding});
                maxWidth = Math.max(annotation.x() + annotation.transform()['x'],maxWidth);
            }
        }
        if (relations) {
            for (let relation of relations) {
                let {x} = relation.transform();
                relation.transform({x: x+padding});
                maxWidth = Math.max(relation.x() + relation.transform()['x'], maxWidth);
            }
        }
        if (maxWidth > this.board.style.width) {
            this.board.style.width = maxWidth;
            this.board.svg.size(this.board.style.width, this.board.style.height);
        }
    }
    
    private extendAnnotationLine(lineNo, type) {
        let s = lineNo - 1;                     // Array lines.* index
        let textlines = this.board.lines['text'];
        let highlights = this.board.lines['highlight'];
        let annotations = this.board.lines['annotation'];
        let relations = this.board.lines['relation'];
        let lineHeight = type == 'label' ? this.lineHeight : this.lineHeight * 2 / 3;
        for (let i = s; i < textlines.length; i++) {
            textlines[i].dy(lineHeight);
            if (highlights[i]) {
                for (let highlight of highlights[i]) {
                    highlight.dy(lineHeight);
                }
            }
            if (annotations[i]) {
                for (let annotation of annotations[i]) {
                    let {y} = annotation.transform();
                    annotation.transform({y: y+lineHeight});
                }
            }
            if (relations[i]) {
                for (let relation of relations[i]) {
                    let {y} = relation.transform();
                    relation.transform({y: y+lineHeight});
                }
            }
        }
        this.board.style.height += lineHeight;
        this.board.resize(this.board.style.width, this.board.style.height);
        return this.lineHeight;
    }

    private underscoreLine(lineNo, start, end) {
        if (end == -1) {
            end = this.board.lines['raw'][lineNo - 1].length - 1;
        }
        let textLine = this.board.lines['text'][lineNo - 1];
        
    }

    private calcAnnotationTop(text, selector) {
        let lineNo = selector.lineNo;
        let width = Util.width(text.node);
        let height = Util.height(text.node);
        let left = selector.left + selector.width / 2 - width / 2;
        let top = selector.top - this.margin - height;
        while (this.isCollisionInLine(lineNo, width + 4, height + 4, left - 2, top + 2)) {
            top -= this.lineHeight;
        }
        return top;
    }

    private calcRelationTop(lineNo, width, height, top, left) {
        while (this.isCollisionInLine(lineNo, width + 10, height, left - 5, top)) {
            top -= this.lineHeight * 2 /3;
        }
        return top;
    }

    private isCollisionInLine(lineNo, width, height, left, top) {
        let annotations = this.board.lines['annotation'][lineNo - 1];
        let relations = this.board.lines['relation'][lineNo -1];
        if (annotations.length < 1 && relations.length < 1) {
            return false;
        }
        let minY = 100000000;
        let testCollision = elements => {
            for (let element of elements) {
                let y = element.y() + element.parent().transform()['y'];
                if (element.type == 'rect') {
                    if (minY > y) {
                        minY = y;
                    }
                    if (this.isCollision(left, top, width, height, element.x(), y, element.width(), element.height())) {
                        return true;
                    }
                }
            }
            return false;
        };
        for (let annotaion of annotations) {
            let elements = annotaion.children();
            if (testCollision(elements)) return true;
        }
        for (let relation of relations) {
            let elements = relation.children();
            if (testCollision(elements)) return true;
        }
        if (top < minY - 2) {
            this.needExtend = true;
        }
        return false;
    }

    private isCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        if (x1 >= x2 && x1 >= x2 + w2) {
            return false;
        } else if (x1 <= x2 && x1 + w1 <= x2) {
            return false;
        } else if (y1 >= y2 && y1 >= y2 + h2) {
            return false;
        } else if (y1 <= y2 && y1 + h1 <= y2) {
            return false;
        }
        return true;
    }
}