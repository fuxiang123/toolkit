<template>
  <canvas ref="measureCanvasRef"></canvas>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { fabric } from 'fabric';

type PosType = {
  x: number;
  y: number;
};

const measureCanvasRef = ref<HTMLCanvasElement>();

let canvas: fabric.Canvas;

/** 标注的起始点 */
let startDot: fabric.Circle | null = null;

/** 标注的结束点 */
let endDot: fabric.Circle | null = null;

/** 移动中的结束点 */
let moveingEndPos: PosType;

/** 定位用的线 */
let locationLineElements: fabric.Object[] = [];

/** 定位线的坐标 */
let drawLocationLinePos: PosType | null = null;

/** 视频的原始宽高 */
let initWidth = 0;
let initHeight = 0;

/** 全部的圆点 */
const getAllDots = () => {
  const result: fabric.Object[] = [];
  [startDot, endDot].forEach(x => {
    if (x) {
      result.push(x);
    }
  });
  return result;
};

/** 开始和结束的连线 */
let start2endLine: fabric.Line | null = null;

/** 重置大小的计时器 */
let resetTimer: NodeJS.Timeout;

const props = defineProps({
  width: {
    type: Number,
    default: () => 0,
  },
  height: {
    type: Number,
    default: () => 0,
  },
  /**
   * 0: 测距
   * 1: 量角器
   */
  type: {
    type: String,
    default: () => '0',
  },
});

const emits = defineEmits<{ (event: 'distanceChange', value: number): void }>();

// *******************************************************
onMounted(() => {
  initCanvas();
});

/** 画布被点击 */
const onCanvasClick = (left: number, top: number) => {
  if (!startDot) {
    startDot = drawCircle({ x: left, y: top });
    if (props.type === '1') {
      drawLocationLine({ x: left, y: top }).forEach(x => canvas.add(x));
    }
    canvas.add(startDot);
    return;
  }
  if (!endDot) {
    endDot = drawCircle({ x: left, y: top });
    canvas.add(endDot);
    return;
  }
};

/** 鼠标在画布上移动 */
const onCanvasMouseMove = (pos: PosType) => {
  if (!startDot) {
    return;
  }
  const dotOffset = (startDot.width ?? 0) / 2;
  if (start2endLine) {
    canvas.remove(start2endLine);
  }
  const startPos = {
    x: startDot.left! + dotOffset,
    y: startDot.top! + dotOffset,
  };
  if (props.type === '1') {
    drawLocationLine(startPos).forEach(x => canvas.add(x));
  }
  moveingEndPos = endDot != null ? { x: endDot.left! + dotOffset, y: endDot.top! + dotOffset } : pos;
  start2endLine = drawLine(startPos, moveingEndPos);
  canvas.add(start2endLine);
  start2endLine.sendToBack();
  locationLineElements.forEach(x => x.sendToBack());
  emits('distanceChange', getLineDistance(startPos, moveingEndPos));
  canvas.renderAll();
};

watch(
  () => props.width,
  (n, o) => {
    if (o === 0) {
      initWidth = n;
    }
    resetSize();
  },
);

watch(
  () => props.height,
  (n, o) => {
    if (o === 0) {
      initHeight = n;
    }
    resetSize();
  },
);

// *******************************************************

/**计算角度 */
const calcAngle = (pos1: PosType, pos2: PosType) => {
  const dot = pos1.x * pos2.x + pos1.y * pos2.y;
  const det = pos1.x * pos2.y - pos1.y * pos2.x;
  const angle = (Math.atan2(det, dot) / Math.PI) * 180;
  return (angle + 360) % 360;
};

/** 重置画布大小和物体的位置 */
const resetSize = () => {
  const oddWidth = canvas.width ?? 0;
  const oddHeight = canvas.height ?? 0;
  canvas.setHeight(props.height);
  canvas.setWidth(props.width);
  const dots = getAllDots();
  dots.forEach(x => canvas.remove(x));
  dots.forEach(x => setObjectsPosition(x, oddWidth, props.width ?? 0, oddHeight, props.height));
  dots.forEach(setObjectsBoundary);
  dots.forEach(x => canvas.add(x));
};

/**
 * 绘制扇形
 * @param angle1 偏转角度
 * @param angle2 弧形区域角度
 * @param x_y 圆心的坐标
 * @param r1 中间的圆心半径
 * @param r2 外层的圆心半径
 */
const drawRing = (angle1: number, angle2: number, x: number, y: number, r1: number, r2: number) => {
  let point1: PosType = { x: 0, y: 0 };
  let point2: PosType = { x: 0, y: 0 };
  let point3: PosType = { x: 0, y: 0 };
  let point4: PosType = { x: 0, y: 0 };
  let isBig = 0;
  angle1 = angle1 % 360;
  angle2 = angle2 % 360;
  if (angle2 > 180) {
    isBig = 1;
  }
  if (!angle2) {
    point1.x = r1 + x;
    point1.y = y;
    point2.x = r2 + x;
    point2.y = y;
    var path = new fabric.Path(
      `M${point1.x},${point1.y} A${r1},${r1} 0 0,1 ${point1.x - 2 * r1},${point1.y}
                A${r1},${r1} 0 0,1 ${point1.x},${point1.y}
                M${point2.x},${point2.y} A${r2},${r2} 0 0,1 ${point2.x - 2 * r2},${point2.y}
                A${r2},${r2} 0 0,1 ${point2.x},${point2.y}`,
      {
        stroke: 'red',
        fill: 'transparent',
        hasControls: false,
      },
    );
  } else {
    point1.x = r1 * Math.cos((angle1 / 180) * Math.PI) + x;
    point1.y = r1 * Math.sin((angle1 / 180) * Math.PI) + y;
    point2.x = r2 * Math.cos((angle1 / 180) * Math.PI) + x;
    point2.y = r2 * Math.sin((angle1 / 180) * Math.PI) + y;
    point3.x = r2 * Math.cos(((angle1 + angle2) / 180) * Math.PI) + x;
    point3.y = r2 * Math.sin(((angle1 + angle2) / 180) * Math.PI) + y;
    point4.x = r1 * Math.cos(((angle1 + angle2) / 180) * Math.PI) + x;
    point4.y = r1 * Math.sin(((angle1 + angle2) / 180) * Math.PI) + y;
    var path = new fabric.Path(
      `M${point1.x},${point1.y} L${point2.x},${point2.y} A${r2},${r2} 0 ${isBig},1 ${point3.x},${point3.y} L${point4.x},${point4.y} A${r1},${r1} 0 ${isBig},0 ${point1.x},${point1.y}`,
      {
        stroke: 'rgba(255, 0, 0, 0.5)',
        fill: 'rgba(255, 0, 0, 0.5)',
        hoverCursor: 'default',
        selectable: false,
      },
    );
  }
  return path;
};

/** 创建开始的圆球 */
const drawCircle = (pos: PosType) => {
  const radius = 5;
  const dotOffset = radius / 2;
  const circle = new fabric.Circle({
    left: pos.x - dotOffset,
    top: pos.y - dotOffset,
    cornerSize: 1,
    fill: 'red',
    radius,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    cornerColor: 'transparent',
    borderColor: 'transparent',
    lockUniScaling: true,
  });
  /** 禁止超出屏幕 */
  circle.on('mouseup', ev => {
    // 获取画布视口边界
    if (!ev.target) {
      return;
    }
    setObjectsBoundary(ev.target);
  });
  return circle;
};

/** 把超出屏幕边界的物体拉回来 */
const setObjectsBoundary = (obj: fabric.Object) => {
  // 是否调整了位置
  let changed = false;
  const canvasBoundaries = canvas.calcViewportBoundaries();
  // 矩形的边界
  const objBoundingRect = obj.getBoundingRect();
  if (objBoundingRect.left < canvasBoundaries.tl.x) {
    obj.left = canvasBoundaries.tl.x;
    changed = true;
  }
  if (objBoundingRect.left + objBoundingRect.width > canvasBoundaries.br.x) {
    obj.left = canvasBoundaries.br.x - objBoundingRect.width;
    changed = true;
  }
  if (objBoundingRect.top < canvasBoundaries.tl.y) {
    obj.top = canvasBoundaries.tl.y;
    changed = true;
  }
  if (objBoundingRect.top + objBoundingRect.height > canvasBoundaries.br.y) {
    obj.top = canvasBoundaries.br.y - objBoundingRect.height;
    changed = true;
  }
  if (changed) {
    onCanvasMouseMove({ x: obj.left ?? 0, y: obj.top ?? 0 });
    canvas.renderAll();
  }
};

/** 设置点的坐标 */
const setObjectsPosition = (obj: fabric.Object, oddWidth: number, newWidth: number, oddHeight: number, newHeight: number) => {
  const diffWidth = (newWidth - oddWidth) / 2;
  const diffHeight = (newHeight - oddHeight) / 2;
  // const widthScale = newWidth / initWidth;
  // const heightScale = newHeight / initHeight;
  obj.left = (obj.left ?? 0) + diffWidth;
  obj.top = (obj.top ?? 0) + diffHeight;
  canvas.renderAll();
  setTimeout(() => {
    onCanvasMouseMove({ x: 0, y: 0 });
  }, 0);
};

/** 获取两个像素点之间的长度 */
const getLineDistance = (p1: PosType, p2: PosType) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

/** 绘制十字 */
const drawLocationLine = (pos: PosType) => {
  // if (drawLocationLinePos && drawLocationLinePos.x === pos.x && drawLocationLinePos.y === pos.y) {
  //   return [];
  // }
  const lineHeight = 100;

  drawLocationLinePos = {
    x: pos.x,
    y: pos.y,
  };
  locationLineElements.forEach(x => canvas.remove(x));
  locationLineElements = [];
  // 横线
  const horizontalLine = drawLine(
    {
      x: pos.x - lineHeight / 2,
      y: pos.y,
    },
    {
      x: pos.x + lineHeight / 2,
      y: pos.y,
    },
  );
  locationLineElements.push(horizontalLine);
  // 竖线
  const verticalLine = drawLine(
    {
      x: pos.x,
      y: pos.y - lineHeight / 2,
    },
    {
      x: pos.x,
      y: pos.y + lineHeight / 2,
    },
  );

  locationLineElements.push(verticalLine);
  if (moveingEndPos) {
    // 鼠标是否在右边
    const isRight = moveingEndPos.x > pos.x;

    const pos1 = moveingEndPos;

    const pos2 = {
      x: pos.x,
      y: pos.y - lineHeight / 2,
    };

    const pos3 = pos;
    const angle = calcAngle(
      {
        x: pos1.x - pos3.x,
        y: pos1.y - pos3.y,
      },
      {
        x: pos2.x - pos3.x,
        y: pos2.y - pos3.y,
      },
    );
    const targetPos = pos1.x;
    if (pos2.x === targetPos && pos3.x === targetPos) {
      return locationLineElements;
    }

    if (isRight) {
      const ring = drawRing(270, -angle, pos.x + 2, pos.y, 0, 40);
      locationLineElements.push(ring);
    } else {
      const ring = drawRing(-90 * 5, -(360 - angle), pos.x + 2, pos.y, 0, 40);
      ring.scaleX = -1;
      locationLineElements.push(ring);
    }
  }
  return locationLineElements;
};

/** 绘制线条 */
const drawLine = (startPos: PosType, endPos: PosType) => {
  return new fabric.Line([startPos.x, startPos.y, endPos.x, endPos.y], {
    strokeWidth: 2,
    stroke: 'blue',
    hoverCursor: 'default',
    selectable: false,
  });
};

const initCanvas = () => {
  canvas = new fabric.Canvas(measureCanvasRef.value!, {
    selection: false,
    width: props.width,
    height: props.height,
  });
  canvas.on('mouse:down', options => {
    if (options.target && options.target !== start2endLine) {
      return;
    }
    onCanvasClick(options.pointer?.x ?? 0, options.pointer?.y ?? 0);
  });
  canvas.on('mouse:move', options => {
    onCanvasMouseMove({
      x: options.pointer?.x ?? 0,
      y: options.pointer?.y ?? 0,
    });
  });
};
</script>
