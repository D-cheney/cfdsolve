<script setup lang="ts">
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Circle, Copy, Download, Eye, EyeOff, FileJson, FilePlus2, FlipHorizontal2, Grid3X3, Group, Hexagon, Layers3, Lock, LockOpen, Maximize2, Minus, MousePointer2, Redo2, RotateCw, Ruler, Save, ScanLine, Scissors, Search, Shapes, Spline, Square, Trash2, Undo2, Upload, X } from 'lucide-vue-next'
import type { ConstraintKind, ModelingDocument, ModelingEntity, ModelingEntityKind, Vec2 } from '~/types/modeling'
import { EPS, TAU, arcEndpoints, cloneDocument, combinedBounds, distance, distanceToEntity, entityArea, entityBounds, modelingEntityLength, modelingEntitySnapPoints, entityVertices, intersections, modelingId, modelingOffsetEntity, modelingTranslateEntity } from '~/utils/modeling-geometry'
import { importAsciiDxf, importSvg } from '~/utils/modeling-file-exchange'
import { createModelingDocument, useModelingStore } from '~/stores/modeling'

type Tool = 'select'|'point'|'line'|'polyline'|'rectangle'|'circle'|'arc'|'ellipse'|'polygon'|'slot'|'spline'|'trim'|'offset'|'measure'
const props = defineProps<{ resetToken?: number }>()
const emit = defineEmits<{ 'geometry-change': [value: ReturnType<typeof useModelingStore>['summary']]; 'go-mesh': [] }>()
const store = useModelingStore()
const svgRef = ref<SVGSVGElement|null>(null)
const fileInput = ref<HTMLInputElement|null>(null)
const tool = ref<Tool>('select')
const draft = ref<Vec2[]>([])
const cursor = ref<Vec2>({x:0,y:0})
const hovered = ref<string|null>(null)
const notice = ref('选择工具开始二维建模')
const leftOpen = ref(true)
const rightOpen = ref(true)
const panel = ref<'property'|'check'|'parameter'>('property')
const polygonSides = ref(6)
const offsetDistance = ref(5)
const transformValue = ref(15)
const dimensionValue = ref(100)
const groupName = ref('入口边')
const panning = ref<{screen:Vec2;center:Vec2}|null>(null)
const dragging = ref<{start:Vec2;originals:Map<string,ModelingEntity>;moved:boolean}|null>(null)
const selecting = ref<{start:Vec2;current:Vec2}|null>(null)
const spaceDown = ref(false)

const doc = computed(()=>store.document)
const entities = computed(()=>doc.value.entities)
const selected = computed(()=>store.selectedEntities[0]??null)
const diagnostics = computed(()=>store.diagnostics)
const vw = computed(()=>1000/doc.value.view.pixelsPerMm)
const vh = computed(()=>620/doc.value.view.pixelsPerMm)
const viewBox = computed(()=>`${doc.value.view.center.x-vw.value/2} ${-doc.value.view.center.y-vh.value/2} ${vw.value} ${vh.value}`)
const gridX = computed(()=>gridValues(doc.value.view.center.x-vw.value/2,doc.value.view.center.x+vw.value/2))
const gridY = computed(()=>gridValues(doc.value.view.center.y-vh.value/2,doc.value.view.center.y+vh.value/2))
const unitFactor = computed(()=>doc.value.displayLengthUnit==='m'?.001:doc.value.displayLengthUnit==='cm'?.1:1)
const cursorLabel = computed(()=>`${(cursor.value.x*unitFactor.value).toFixed(2)}, ${(cursor.value.y*unitFactor.value).toFixed(2)} ${doc.value.displayLengthUnit}`)
const drawingTools:{key:Tool;label:string;icon:any;keyName?:string}[]=[
  {key:'select',label:'选择',icon:MousePointer2,keyName:'V'},{key:'point',label:'点',icon:Shapes},{key:'line',label:'直线',icon:Minus,keyName:'L'},
  {key:'polyline',label:'连续线',icon:Spline,keyName:'P'},{key:'rectangle',label:'矩形',icon:Square,keyName:'R'},{key:'circle',label:'圆',icon:Circle,keyName:'C'},
  {key:'arc',label:'圆弧',icon:ScanLine,keyName:'A'},{key:'ellipse',label:'椭圆',icon:Shapes},{key:'polygon',label:'多边形',icon:Hexagon},
  {key:'slot',label:'槽形',icon:ScanLine},{key:'spline',label:'样条',icon:Spline},
]
const kindNames:Record<ModelingEntityKind,string>={point:'点',line:'直线',polyline:'连续线',rectangle:'矩形',circle:'圆',arc:'圆弧',ellipse:'椭圆',polygon:'多边形',slot:'槽形',spline:'样条'}
const constraintNames:Record<ConstraintKind,string>={coincident:'重合',horizontal:'水平',vertical:'竖直',fixed:'固定',parallel:'平行',perpendicular:'垂直',equalLength:'等长',concentric:'同心',equalRadius:'等半径',tangent:'相切',length:'长度',radius:'半径',diameter:'直径',angle:'角度'}
const instruction=computed(()=>{
  if(tool.value==='select') return store.selectedIds.length?`已选择 ${store.selectedIds.length} 个对象，可拖动或精确编辑`:'单击、框选或 Shift 多选；滚轮缩放，中键平移'
  if(tool.value==='polyline'||tool.value==='spline') return draft.value.length?'继续单击；Enter 结束，单击起点闭合':'单击起点'
  if(tool.value==='arc') return ['单击圆心','单击起点','单击终点'][draft.value.length]
  if(tool.value==='trim') return '单击要删除的局部区间；没有交点时保持原对象'
  if(tool.value==='offset') return `单击对象生成 ${offsetDistance.value} mm 偏移副本`
  if(tool.value==='measure') return '单击对象测量长度、周长和面积'
  return draft.value.length?'单击确定第二点':'单击确定第一点'
})

function gridValues(min:number,max:number){const size=doc.value.preferences.gridSize;const start=Math.floor(min/size)*size;return Array.from({length:Math.min(300,Math.ceil((max-start)/size)+1)},(_,i)=>start+i*size)}
function activate(next:Tool){tool.value=next;draft.value=[];notice.value=instruction.value??''}
function toWorld(event:MouseEvent|PointerEvent|WheelEvent):Vec2{const svg=svgRef.value;if(!svg)return{x:0,y:0};const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const m=svg.getScreenCTM()?.inverse();if(!m)return{x:0,y:0};const q=p.matrixTransform(m);return{x:q.x,y:-q.y}}
function snap(raw:Vec2){let result={...raw};let best=10/doc.value.view.pixelsPerMm;if(doc.value.preferences.snapObjects)for(const e of entities.value.filter(e=>e.visible))for(const p of modelingEntitySnapPoints(e)){const d=distance(raw,p);if(d<best){best=d;result={x:p.x,y:p.y}}}if(doc.value.preferences.snapAngle&&draft.value.length&&best===10/doc.value.view.pixelsPerMm){const a=draft.value.at(-1)!;const r=distance(a,raw);const inc=doc.value.preferences.angleIncrement*Math.PI/180;const angle=Math.round(Math.atan2(raw.y-a.y,raw.x-a.x)/inc)*inc;const p={x:a.x+Math.cos(angle)*r,y:a.y+Math.sin(angle)*r};if(distance(raw,p)<best)result=p}if(doc.value.preferences.snapGrid&&best===10/doc.value.view.pixelsPerMm){const g=doc.value.preferences.gridSize;result={x:Math.round(result.x/g)*g,y:Math.round(result.y/g)*g}}return result}
function make(kind:ModelingEntityKind,points:Vec2[]=[]):ModelingEntity{return{id:modelingId(kind),kind,name:`${kindNames[kind]} ${entities.value.length+1}`,layerId:'layer-default',points:points.map(p=>({...p})),construction:false,locked:false,visible:true}}
function move(event:PointerEvent){const raw=toWorld(event);cursor.value=event.ctrlKey?raw:snap(raw);if(panning.value){const rect=svgRef.value!.getBoundingClientRect();doc.value.view.center={x:panning.value.center.x-(event.clientX-panning.value.screen.x)/rect.width*vw.value,y:panning.value.center.y+(event.clientY-panning.value.screen.y)/rect.height*vh.value};return}if(selecting.value)selecting.value.current=raw;if(dragging.value){const delta={x:raw.x-dragging.value.start.x,y:raw.y-dragging.value.start.y};dragging.value.moved ||= distance(raw,dragging.value.start)>.1;for(const[id,e]of dragging.value.originals){const i=doc.value.entities.findIndex(x=>x.id===id);if(i>=0)doc.value.entities[i]=modelingTranslateEntity(e,delta)}}else if(tool.value==='select'){const tol=8/doc.value.view.pixelsPerMm;hovered.value=entities.value.filter(e=>e.visible).sort((a,b)=>distanceToEntity(raw,a)-distanceToEntity(raw,b)).find(e=>distanceToEntity(raw,e)<tol)?.id??null}}
function backgroundDown(event:PointerEvent){if(event.button===1||spaceDown.value){event.preventDefault();svgRef.value?.setPointerCapture(event.pointerId);panning.value={screen:{x:event.clientX,y:event.clientY},center:{...doc.value.view.center}}}else if(event.button===0&&tool.value==='select'){store.selectedIds=event.shiftKey?store.selectedIds:[];selecting.value={start:toWorld(event),current:toWorld(event)};svgRef.value?.setPointerCapture(event.pointerId)}}
function pointerUp(event:PointerEvent){if(panning.value){panning.value=null;svgRef.value?.releasePointerCapture(event.pointerId)}if(selecting.value){const{s:start,current:c}= {s:selecting.value.start,current:selecting.value.current};if(distance(start,c)>1/doc.value.view.pixelsPerMm){const minX=Math.min(start.x,c.x),maxX=Math.max(start.x,c.x),minY=Math.min(start.y,c.y),maxY=Math.max(start.y,c.y),cross=c.x<start.x;const ids=entities.value.filter(e=>{const b=entityBounds(e);return cross?b.maxX>=minX&&b.minX<=maxX&&b.maxY>=minY&&b.minY<=maxY:b.minX>=minX&&b.maxX<=maxX&&b.minY>=minY&&b.maxY<=maxY}).map(e=>e.id);store.selectedIds=event.shiftKey?[...new Set([...store.selectedIds,...ids])]:ids}selecting.value=null;svgRef.value?.releasePointerCapture(event.pointerId)}if(dragging.value){if(dragging.value.moved){const final=new Map(store.selectedIds.map(id=>[id,cloneDocument(doc.value.entities.find(e=>e.id===id)!)]));for(const[id,e]of dragging.value.originals){const i=doc.value.entities.findIndex(x=>x.id===id);if(i>=0)doc.value.entities[i]=e}store.replaceEntities(final,'拖动对象')}dragging.value=null;svgRef.value?.releasePointerCapture(event.pointerId)}}
function entityDown(event:PointerEvent,e:ModelingEntity){event.stopPropagation();if(tool.value!=='select')return;store.toggleSelection(e.id,event.shiftKey);if(!e.locked){dragging.value={start:toWorld(event),originals:new Map(store.selectedEntities.map(x=>[x.id,cloneDocument(x)])),moved:false};svgRef.value?.setPointerCapture(event.pointerId)}}
function canvasClick(event:MouseEvent){if(['select','trim','offset','measure'].includes(tool.value))return;const p=event.ctrlKey?toWorld(event):snap(toWorld(event));if(tool.value==='point'){store.addEntity(make('point',[p]));return}if(tool.value==='polyline'||tool.value==='spline'){if(draft.value.length>2&&distance(p,draft.value[0]!)<10/doc.value.view.pixelsPerMm)return finishChain(true);draft.value.push(p);return}draft.value.push(p);if(draft.value.length<(tool.value==='arc'?3:2))return;createEntity()}
function createEntity(){const[a,b,c]=draft.value;if(!a||!b)return;let e:ModelingEntity;if(tool.value==='line')e=make('line',[a,b]);else if(tool.value==='rectangle'){e=make('rectangle',[a,b]);e.closed=true}else if(tool.value==='circle'){e=make('circle');e.center=a;e.radius=distance(a,b);e.closed=true}else if(tool.value==='ellipse'){e=make('ellipse');e.center=a;e.radius=Math.abs(b.x-a.x);e.radiusY=Math.abs(b.y-a.y);e.closed=true}else if(tool.value==='polygon'){e=make('polygon');e.center=a;e.radius=distance(a,b);e.sides=polygonSides.value;e.rotation=Math.atan2(b.y-a.y,b.x-a.x);e.closed=true}else if(tool.value==='slot'){e=make('slot',[a,b]);e.radius=Math.max(1,Math.min(20,distance(a,b)/4));e.closed=true}else if(tool.value==='arc'&&c){e=make('arc');e.center=a;e.radius=distance(a,b);e.startAngle=Math.atan2(b.y-a.y,b.x-a.x);let sweep=Math.atan2(c.y-a.y,c.x-a.x)-e.startAngle;while(sweep<=-Math.PI)sweep+=TAU;while(sweep>Math.PI)sweep-=TAU;e.sweepAngle=sweep}else return;if((e.radius??1)<EPS*10||(e.points.length>1&&distance(e.points[0]!,e.points[1]!)<EPS*10))notice.value='尺寸过小，未创建对象';else{store.addEntity(e);if(e.kind==='line'&&doc.value.preferences.autoConstraint){if(Math.abs(e.points[1]!.y-e.points[0]!.y)<EPS*10)store.addConstraint('horizontal',[e.id]);else if(Math.abs(e.points[1]!.x-e.points[0]!.x)<EPS*10)store.addConstraint('vertical',[e.id])}}draft.value=[]}
function finishChain(closed=false){if(draft.value.length<2)return;const e=make(tool.value==='spline'?'spline':'polyline',draft.value);e.closed=closed;store.addEntity(e);draft.value=[]}
function entityPath(e:ModelingEntity){const p=entityVertices(e);if(e.kind==='line'&&p.length>1)return`M ${p[0]!.x} ${-p[0]!.y} L ${p[1]!.x} ${-p[1]!.y}`;if((e.kind==='polyline'||e.kind==='spline')&&p.length)return`M ${p.map(x=>`${x.x} ${-x.y}`).join(' L ')}${e.closed?' Z':''}`;if((e.kind==='rectangle'||e.kind==='polygon')&&p.length)return`M ${p.map(x=>`${x.x} ${-x.y}`).join(' L ')} Z`;if(e.kind==='slot'&&e.points.length>1&&e.radius){const[a,b]=e.points,angle=Math.atan2(b!.y-a!.y,b!.x-a!.x),n={x:-Math.sin(angle)*e.radius,y:Math.cos(angle)*e.radius},q=[{x:a!.x+n.x,y:a!.y+n.y},{x:b!.x+n.x,y:b!.y+n.y},{x:b!.x-n.x,y:b!.y-n.y},{x:a!.x-n.x,y:a!.y-n.y}];return`M ${q[0]!.x} ${-q[0]!.y} L ${q[1]!.x} ${-q[1]!.y} A ${e.radius} ${e.radius} 0 0 1 ${q[2]!.x} ${-q[2]!.y} L ${q[3]!.x} ${-q[3]!.y} A ${e.radius} ${e.radius} 0 0 1 ${q[0]!.x} ${-q[0]!.y} Z`}if(e.kind==='arc'&&e.center&&e.radius){const[s,t]=arcEndpoints(e),sweep=e.sweepAngle??0;return`M ${s!.x} ${-s!.y} A ${e.radius} ${e.radius} 0 ${Math.abs(sweep)>Math.PI?1:0} ${sweep>0?0:1} ${t!.x} ${-t!.y}`}return''}
function draftPath(){return draft.value.length?`M ${[...draft.value,cursor.value].map(p=>`${p.x} ${-p.y}`).join(' L ')}`:''}
function entityClick(event:MouseEvent,e:ModelingEntity){event.stopPropagation();if(tool.value==='offset'){const copy=modelingOffsetEntity(e,offsetDistance.value);if(!copy)return notice.value='该距离不能生成有效偏移';copy.id=modelingId(copy.kind);copy.name=`${e.name} 偏移`;copy.generatedBy=e.id;store.addEntity(copy,'偏移对象');notice.value='已生成偏移副本'}else if(tool.value==='measure'){store.selectedIds=[e.id];notice.value=entityArea(e)>EPS?`周长 ${modelingEntityLength(e).toFixed(3)} mm，面积 ${entityArea(e).toFixed(3)} mm²`:`长度 ${modelingEntityLength(e).toFixed(3)} mm`}else if(tool.value==='trim')trim(e,toWorld(event))}
function trim(e:ModelingEntity,p:Vec2){const cuts=entities.value.filter(x=>x.id!==e.id&&x.visible).flatMap(x=>intersections(e,x));if(e.kind==='line'&&e.points.length>1&&cuts.length){const[a,b]=e.points,nodes=[a!,...cuts.sort((x,y)=>distance(a!,x)-distance(a!,y)),b!],mids=nodes.slice(0,-1).map((x,i)=>({i,d:distance(p,{x:(x.x+nodes[i+1]!.x)/2,y:(x.y+nodes[i+1]!.y)/2})})),remove=mids.sort((x,y)=>x.d-y.d)[0]!.i,parts=nodes.slice(0,-1).map((x,i)=>i===remove?null:{...cloneDocument(e),id:modelingId('line'),name:`${e.name}.${i+1}`,points:[x,nodes[i+1]!] }).filter(Boolean) as ModelingEntity[];store.snapshot('修剪直线');doc.value.entities=doc.value.entities.filter(x=>x.id!==e.id);doc.value.entities.push(...parts);store.selectedIds=parts.map(x=>x.id);store.finish('修剪直线');notice.value='已删除所指线段'}else notice.value='没有可修剪区间，原对象保持不变'}
function wheel(event:WheelEvent){event.preventDefault();const before=toWorld(event);doc.value.view.pixelsPerMm=Math.max(.05,Math.min(100,doc.value.view.pixelsPerMm*(event.deltaY<0?1.12:1/1.12)));nextTick(()=>{const after=toWorld(event);doc.value.view.center.x+=before.x-after.x;doc.value.view.center.y+=before.y-after.y})}
function fit(){const b=combinedBounds(entities.value);if(!b){doc.value.view={center:{x:0,y:0},pixelsPerMm:3};return}doc.value.view.center={x:(b.minX+b.maxX)/2,y:(b.minY+b.maxY)/2};doc.value.view.pixelsPerMm=Math.max(.05,Math.min(100,Math.min(900/Math.max(20,b.maxX-b.minX),540/Math.max(20,b.maxY-b.minY))*.9))}
function constrain(kind:ConstraintKind){const n=['parallel','perpendicular','equalLength','concentric','equalRadius','tangent'].includes(kind)?2:1;if(store.selectedIds.length!==n)return notice.value=`请选择 ${n} 个适用对象`;const value=['length','radius','diameter','angle'].includes(kind)?dimensionValue.value:undefined;if(!store.addConstraint(kind,store.selectedIds,value))return notice.value=`无法添加${constraintNames[kind]}：请检查对象类型、数值或重复约束`;notice.value=`已添加${constraintNames[kind]}约束`}
function rotate(){const b=combinedBounds(store.selectedEntities);if(!b)return;store.transformSelected('rotate',{center:{x:(b.minX+b.maxX)/2,y:(b.minY+b.maxY)/2},radians:transformValue.value*Math.PI/180})}
function mirror(){const b=combinedBounds(store.selectedEntities);if(!b)return;const x=(b.minX+b.maxX)/2;store.transformSelected('mirror',{axis:[{x,y:b.minY-10},{x,y:b.maxY+10}]})}
function makeRegion(){if(!store.createRegion(store.selectedIds))notice.value='请选择有效封闭轮廓';else notice.value='已生成二维区域'}
function update(field:'x'|'y'|'radius',event:Event){if(!selected.value)return;const v=Number((event.target as HTMLInputElement).value);if(!Number.isFinite(v))return;if(field==='radius')store.updateEntity(selected.value.id,{radius:Math.max(EPS*10,v)},'修改半径');else{const a=selected.value.center??selected.value.points[0];if(!a)return;store.replaceEntities(new Map([[selected.value.id,modelingTranslateEntity(selected.value,field==='x'?{x:v-a.x,y:0}:{x:0,y:v-a.y})]]),'修改坐标')}}
function updateRectangleSize(field:'width'|'height',event:Event){if(!selected.value||selected.value.kind!=='rectangle'||selected.value.points.length<2)return;const value=Math.max(EPS*10,Math.abs(Number((event.target as HTMLInputElement).value)));if(!Number.isFinite(value))return;const [a,b]=selected.value.points;const direction=field==='width'?Math.sign(b!.x-a!.x)||1:Math.sign(b!.y-a!.y)||1;const end={...b!};if(field==='width')end.x=a!.x+direction*value;else end.y=a!.y+direction*value;store.updateEntity(selected.value.id,{points:[{...a!},end]},field==='width'?'修改矩形宽度':'修改矩形高度')}
function toggle(e:ModelingEntity,key:'visible'|'locked'){const i=doc.value.entities.findIndex(x=>x.id===e.id);if(i<0)return;store.snapshot(key==='visible'?'切换显隐':'切换锁定');doc.value.entities[i]={...e,[key]:!e[key]};store.finish(key==='visible'?'切换显隐':'切换锁定')}
function download(name:string,text:string,type:string){const url=URL.createObjectURL(new Blob([text],{type}));const a=window.document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
function safeName(){return doc.value.name.replace(/[\\/:*?"<>|]/g,'-')||'二维模型'}
function exportProject(){download(`${safeName()}.cfd2d.json`,JSON.stringify(doc.value,null,2),'application/json')}
function exportSvg(){const b=combinedBounds(entities.value)??{minX:-100,minY:-50,maxX:100,maxY:50};const body=entities.value.filter(e=>e.visible&&!e.construction).map(e=>e.kind==='circle'&&e.center?`<circle cx="${e.center.x}" cy="${-e.center.y}" r="${e.radius}"/>`:e.kind==='ellipse'&&e.center?`<ellipse cx="${e.center.x}" cy="${-e.center.y}" rx="${e.radius}" ry="${e.radiusY}"/>`:`<path d="${entityPath(e)}"/>`).join('\n');download(`${safeName()}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${b.minX} ${-b.maxY} ${b.maxX-b.minX} ${b.maxY-b.minY}" fill="none" stroke="#111">${body}</svg>`,'image/svg+xml')}
function exportDxf(){const r:(string|number)[]=['0','SECTION','2','HEADER','9','$INSUNITS','70','4','0','ENDSEC','0','SECTION','2','ENTITIES'];for(const e of entities.value.filter(x=>x.visible&&!x.construction)){if(e.kind==='line'&&e.points.length>1)r.push('0','LINE','8',e.layerId,'10',e.points[0]!.x,'20',e.points[0]!.y,'11',e.points[1]!.x,'21',e.points[1]!.y);else if(e.kind==='circle'&&e.center)r.push('0','CIRCLE','8',e.layerId,'10',e.center.x,'20',e.center.y,'40',e.radius??0);else{const p=entityVertices(e);if(p.length){r.push('0','LWPOLYLINE','8',e.layerId,'90',p.length,'70',e.closed?1:0);p.forEach(q=>r.push('10',q.x,'20',q.y))}}}r.push('0','ENDSEC','0','EOF');download(`${safeName()}.dxf`,r.join('\r\n'),'application/dxf')}
async function openFile(event:Event){const input=event.target as HTMLInputElement,file=input.files?.[0];input.value='';if(!file)return;try{if(file.size>50*1024*1024)throw new Error('文件超过 50 MiB');const text=await file.text(),lower=file.name.toLowerCase();if(lower.endsWith('.dxf')||lower.endsWith('.svg')){const imported=lower.endsWith('.dxf')?importAsciiDxf(text):importSvg(text);const next=createModelingDocument();next.name=file.name.replace(/\.(dxf|svg)$/i,'');next.entities=imported.entities;next.layers=imported.layers;store.replaceDocument(next,`导入 ${file.name}`);await nextTick();fit();notice.value=`已导入 ${imported.entities.length} 个对象${imported.warnings.length?`，${imported.warnings.length} 条提示`:''}`}else{const parsed=JSON.parse(text) as ModelingDocument;if(parsed.format!=='cfdrookie-model2d'||parsed.schemaVersion!==1||!Array.isArray(parsed.entities)||parsed.entities.length>20000)throw new Error('项目文件格式或对象数不符合要求');store.replaceDocument(parsed);await nextTick();fit();notice.value=`已打开 ${file.name}`}}catch(error){notice.value=`打开失败：${error instanceof Error?error.message:'未知错误'}`}}
function newModel(){if(entities.value.length&&!confirm('新建空白模型？当前模型已保存在本机历史中。'))return;store.newDocument();fit();notice.value='已创建空白二维模型'}
function keydown(event:KeyboardEvent){if(['INPUT','TEXTAREA','SELECT'].includes((event.target as HTMLElement)?.tagName))return;if(event.code==='Space'){spaceDown.value=true;event.preventDefault()}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?store.redo():store.undo();return}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();store.save();return}if(event.key==='Delete')store.deleteSelected();if(event.key==='Escape'){draft.value=[];tool.value='select'}if(event.key==='Backspace'&&draft.value.length){event.preventDefault();draft.value.pop()}if(event.key==='Enter'&&(tool.value==='polyline'||tool.value==='spline'))finishChain(false);const hit=drawingTools.find(x=>x.keyName?.toLowerCase()===event.key.toLowerCase());if(hit)activate(hit.key);if(event.key.toLowerCase()==='t')activate('trim');if(event.key.toLowerCase()==='o')activate('offset');if(event.key.toLowerCase()==='d')activate('measure');if(event.key.toLowerCase()==='f')fit()}
watch(()=>props.resetToken,(n,o)=>{if(n!==o)newModel()});watch(()=>store.summary,s=>emit('geometry-change',s),{deep:true,immediate:true})
onMounted(async()=>{if(window.matchMedia('(max-width: 899px)').matches){leftOpen.value=false;rightOpen.value=false}await store.initialize();window.addEventListener('keydown',keydown);window.addEventListener('keyup',e=>{if(e.code==='Space')spaceDown.value=false});window.addEventListener('blur',()=>{spaceDown.value=false;panning.value=null;dragging.value=null})})
onBeforeUnmount(()=>window.removeEventListener('keydown',keydown))
</script>

<template>
  <section class="modeler">
    <header class="topbar">
      <div class="file-actions">
        <button title="新建" @click="newModel"><FilePlus2 :size="18"/><span>新建</span></button>
        <button title="打开" @click="fileInput?.click()"><Upload :size="18"/><span>打开</span></button>
        <button title="保存到本机" @click="store.save"><Save :size="18"/><span>保存</span></button>
        <input ref="fileInput" type="file" accept=".json,.cfd2d.json,.dxf,.svg" hidden @change="openFile">
        <i></i>
        <button :disabled="!store.history.length" title="撤销" @click="store.undo"><Undo2 :size="18"/></button>
        <button :disabled="!store.future.length" title="重做" @click="store.redo"><Redo2 :size="18"/></button>
      </div>
      <div class="title"><input v-model.trim="doc.name" aria-label="模型名称" @change="store.finish('修改模型名称')"><small>{{ store.saveStatus }}</small></div>
      <div class="file-actions exports">
        <button title="导出项目" @click="exportProject"><FileJson :size="18"/><span>项目</span></button>
        <button title="导出 DXF" @click="exportDxf"><Download :size="18"/><span>DXF</span></button>
        <button title="导出 SVG" @click="exportSvg"><Download :size="18"/><span>SVG</span></button>
        <button class="continue" title="进入网格划分" :disabled="!store.closedProfiles" @click="emit('go-mesh')"><Grid3X3 :size="18"/><span>进入网格</span></button>
      </div>
    </header>

    <div class="ribbon">
      <div class="tools">
        <button v-for="item in drawingTools" :key="item.key" :class="{active:tool===item.key}" :title="`${item.label}${item.keyName?` (${item.keyName})`:''}`" @click="activate(item.key)"><component :is="item.icon" :size="19"/><span>{{ item.label }}</span></button>
      </div>
      <i class="rule"></i>
      <div class="tools">
        <button :class="{active:tool==='trim'}" @click="activate('trim')"><Scissors :size="19"/><span>修剪</span></button>
        <button :class="{active:tool==='offset'}" @click="activate('offset')"><Copy :size="19"/><span>偏移</span></button>
        <button :class="{active:tool==='measure'}" @click="activate('measure')"><Ruler :size="19"/><span>测量</span></button>
        <label class="inline-input"><input v-model.number="offsetDistance" type="number" step="1"><em>偏移 mm</em></label>
      </div>
      <i class="rule"></i>
      <div class="tools">
        <button @click="rotate"><RotateCw :size="19"/><span>旋转</span></button>
        <button @click="mirror"><FlipHorizontal2 :size="19"/><span>镜像</span></button>
        <label class="inline-input"><input v-model.number="transformValue" type="number" step="1"><em>旋转 °</em></label>
      </div>
      <i class="rule"></i>
      <div class="tools constraints">
        <button @click="constrain('horizontal')"><b>—</b><span>水平</span></button>
        <button @click="constrain('vertical')"><b>│</b><span>竖直</span></button>
        <button @click="constrain('parallel')"><b>∥</b><span>平行</span></button>
        <button @click="constrain('perpendicular')"><b>⊥</b><span>垂直</span></button>
        <button @click="constrain('equalLength')"><b>=</b><span>等长</span></button>
        <button @click="constrain('length')"><Ruler :size="18"/><span>长度</span></button>
        <button @click="constrain('radius')"><Circle :size="18"/><span>半径</span></button>
        <button @click="constrain('fixed')"><Lock :size="18"/><span>固定</span></button>
        <label class="inline-input"><input v-model.number="dimensionValue" type="number" min=".001" step="1"><em>尺寸 mm</em></label>
      </div>
      <i class="rule"></i>
      <div class="tools">
        <button @click="makeRegion"><Shapes :size="19"/><span>生成区域</span></button>
        <button @click="panel='check';rightOpen=true"><Search :size="19"/><span>检查</span><sup v-if="diagnostics.length">{{ diagnostics.length }}</sup></button>
        <button class="delete" :disabled="!store.selectedIds.length" @click="store.deleteSelected"><Trash2 :size="19"/><span>删除</span></button>
      </div>
    </div>

    <div class="workspace" :class="{leftClosed:!leftOpen,rightClosed:!rightOpen}">
      <aside class="left-panel">
        <div class="panel-head"><span><Layers3 :size="17"/>模型树</span><button @click="leftOpen=false"><ChevronLeft :size="18"/></button></div>
        <section class="tree-block">
          <h4><span>草图对象</span><em>{{ entities.length }}</em></h4>
          <button v-for="entity in entities" :key="entity.id" class="tree-item" :class="{selected:store.selectedIds.includes(entity.id)}" @click="store.toggleSelection(entity.id,$event.shiftKey)">
            <component :is="entity.kind==='circle'?Circle:entity.kind==='rectangle'?Square:entity.kind==='polygon'?Hexagon:Minus" :size="15"/><span>{{ entity.name }}</span>
            <i @click.stop="toggle(entity,'visible')"><component :is="entity.visible?Eye:EyeOff" :size="14"/></i>
            <i @click.stop="toggle(entity,'locked')"><component :is="entity.locked?Lock:LockOpen" :size="14"/></i>
          </button>
          <div v-if="!entities.length" class="tree-empty">空白模型<br><small>从上方选择绘图工具</small></div>
        </section>
        <section class="tree-block">
          <h4><span>二维区域</span><em>{{ doc.regions.length }}</em></h4>
          <div v-for="region in doc.regions" :key="region.id" class="tree-row"><Shapes :size="14"/><span>{{ region.name }}</span><em>{{ region.area.toFixed(1) }}</em></div>
        </section>
        <section class="tree-block">
          <h4><span>几何分组</span><em>{{ doc.groups.length }}</em></h4>
          <div v-for="group in doc.groups" :key="group.id" class="tree-row"><Group :size="14"/><span>{{ group.name }}</span><em>{{ group.entityIds.length }}</em></div>
          <div class="group-form"><input v-model="groupName"><button :disabled="!store.selectedIds.length" @click="store.createGroup(groupName)">建立</button></div>
        </section>
      </aside>

      <main class="canvas-shell">
        <button v-if="!leftOpen" class="open-panel left" @click="leftOpen=true"><ChevronRight :size="18"/></button>
        <button v-if="!rightOpen" class="open-panel right" @click="rightOpen=true"><ChevronLeft :size="18"/></button>
        <div class="canvas-tools"><button @click="fit"><Maximize2 :size="18"/></button><button :class="{active:doc.preferences.gridVisible}" @click="doc.preferences.gridVisible=!doc.preferences.gridVisible"><Grid3X3 :size="18"/></button></div>
        <svg ref="svgRef" class="canvas" :viewBox="viewBox" preserveAspectRatio="xMidYMid meet" @pointermove="move" @pointerdown="backgroundDown" @pointerup="pointerUp" @pointercancel="pointerUp" @click="canvasClick" @wheel="wheel">
          <g v-if="doc.preferences.gridVisible" class="grid"><line v-for="x in gridX" :key="`x${x}`" :x1="x" :x2="x" :y1="-doc.view.center.y-vh/2" :y2="-doc.view.center.y+vh/2"/><line v-for="y in gridY" :key="`y${y}`" :x1="doc.view.center.x-vw/2" :x2="doc.view.center.x+vw/2" :y1="-y" :y2="-y"/></g>
          <g class="axes"><line :x1="doc.view.center.x-vw/2" :x2="doc.view.center.x+vw/2" y1="0" y2="0"/><line x1="0" x2="0" :y1="-doc.view.center.y-vh/2" :y2="-doc.view.center.y+vh/2"/></g>
          <g>
            <template v-for="entity in entities" :key="entity.id">
              <circle v-if="entity.kind==='point'&&entity.points[0]" :cx="entity.points[0].x" :cy="-entity.points[0].y" :r="4/doc.view.pixelsPerMm" class="entity dot" :class="{selected:store.selectedIds.includes(entity.id),hovered:hovered===entity.id,construction:entity.construction,locked:entity.locked}" @pointerdown="entityDown($event,entity)" @click="entityClick($event,entity)"/>
              <circle v-else-if="entity.kind==='circle'&&entity.center" :cx="entity.center.x" :cy="-entity.center.y" :r="entity.radius" fill="transparent" class="entity" :class="{selected:store.selectedIds.includes(entity.id),hovered:hovered===entity.id,construction:entity.construction,locked:entity.locked}" @pointerdown="entityDown($event,entity)" @click="entityClick($event,entity)"/>
              <ellipse v-else-if="entity.kind==='ellipse'&&entity.center" :cx="entity.center.x" :cy="-entity.center.y" :rx="entity.radius" :ry="entity.radiusY" fill="transparent" :transform="`rotate(${-(entity.rotation??0)*180/Math.PI} ${entity.center.x} ${-entity.center.y})`" class="entity" :class="{selected:store.selectedIds.includes(entity.id),hovered:hovered===entity.id}" @pointerdown="entityDown($event,entity)" @click="entityClick($event,entity)"/>
              <path v-else :d="entityPath(entity)" fill="transparent" class="entity" :class="{selected:store.selectedIds.includes(entity.id),hovered:hovered===entity.id,construction:entity.construction,locked:entity.locked,closed:entity.closed}" @pointerdown="entityDown($event,entity)" @click="entityClick($event,entity)"/>
            </template>
          </g>
          <g v-if="draft.length" class="draft"><path :d="draftPath()"/><circle v-for="(point,index) in draft" :key="index" :cx="point.x" :cy="-point.y" :r="4/doc.view.pixelsPerMm"/></g>
          <rect v-if="selecting" :x="Math.min(selecting.start.x,selecting.current.x)" :y="-Math.max(selecting.start.y,selecting.current.y)" :width="Math.abs(selecting.current.x-selecting.start.x)" :height="Math.abs(selecting.current.y-selecting.start.y)" class="selection" :class="{crossing:selecting.current.x<selecting.start.x}"/>
          <g v-if="selected" class="handles"><circle v-for="(point,index) in modelingEntitySnapPoints(selected).filter(p=>p.kind==='endpoint'||p.kind==='center')" :key="index" :cx="point.x" :cy="-point.y" :r="3.5/doc.view.pixelsPerMm"/></g>
        </svg>
        <div class="hint">{{ instruction }}<strong>{{ notice }}</strong></div>
      </main>

      <aside class="right-panel">
        <div class="panel-head"><div class="tabs"><button :class="{active:panel==='property'}" @click="panel='property'">属性</button><button :class="{active:panel==='check'}" @click="panel='check'">检查 <b v-if="diagnostics.length">{{ diagnostics.length }}</b></button><button :class="{active:panel==='parameter'}" @click="panel='parameter'">参数</button></div><button @click="rightOpen=false"><ChevronRight :size="18"/></button></div>
        <div v-if="panel==='property'" class="panel-body">
          <template v-if="selected">
            <h3>{{ kindNames[selected.kind] }} <small>{{ selected.id.slice(-6) }}</small></h3>
            <label><span>名称</span><input :value="selected.name" @change="store.updateEntity(selected.id,{name:($event.target as HTMLInputElement).value},'重命名')"></label>
            <div class="two"><label><span>X</span><input type="number" step=".1" :value="(selected.center??selected.points[0])?.x" @change="update('x',$event)"></label><label><span>Y</span><input type="number" step=".1" :value="(selected.center??selected.points[0])?.y" @change="update('y',$event)"></label></div>
            <div v-if="selected.kind==='rectangle'&&selected.points.length>1" class="two"><label><span>宽度</span><input type="number" min=".001" step=".1" :value="Math.abs(selected.points[1].x-selected.points[0].x)" @change="updateRectangleSize('width',$event)"></label><label><span>高度</span><input type="number" min=".001" step=".1" :value="Math.abs(selected.points[1].y-selected.points[0].y)" @change="updateRectangleSize('height',$event)"></label></div>
            <label v-if="selected.radius!==undefined"><span>半径</span><input type="number" min=".001" step=".1" :value="selected.radius" @change="update('radius',$event)"></label>
            <label v-if="selected.kind==='polygon'"><span>边数</span><input v-model.number="selected.sides" type="number" min="3" max="256" @change="store.finish('修改边数')"></label>
            <div class="metrics"><div><small>长度 / 周长</small><strong>{{ modelingEntityLength(selected).toFixed(3) }} mm</strong></div><div v-if="entityArea(selected)>EPS"><small>面积</small><strong>{{ entityArea(selected).toFixed(3) }} mm²</strong></div></div>
            <div class="toggles"><button :class="{active:selected.construction}" @click="store.updateEntity(selected.id,{construction:!selected.construction},'切换构造几何')">构造几何</button><button :class="{active:selected.locked}" @click="toggle(selected,'locked')">{{ selected.locked?'解除锁定':'锁定' }}</button></div>
            <h4>关联约束</h4><button v-for="item in doc.constraints.filter(c=>c.entityIds.includes(selected.id))" :key="item.id" class="constraint-item" @click="store.removeConstraint(item.id)"><span>{{ constraintNames[item.kind] }}</span><X :size="14"/></button><p v-if="!doc.constraints.some(c=>c.entityIds.includes(selected.id))" class="muted">没有约束</p>
          </template>
          <div v-else class="empty"><MousePointer2 :size="40"/><strong>选择一个对象</strong><p>坐标、尺寸和约束会显示在这里。</p></div>
        </div>
        <div v-else-if="panel==='check'" class="panel-body checks">
          <div v-if="!diagnostics.length" class="healthy"><CheckCircle2 :size="36"/><strong>几何检查通过</strong><p>没有发现零长度、重复或自交对象。</p></div>
          <button v-for="item in diagnostics" :key="item.id" :class="item.severity" @click="store.selectedIds=item.entityIds"><AlertTriangle :size="17"/><span><b>{{ item.code }}</b>{{ item.message }}</span></button>
        </div>
        <div v-else class="panel-body"><p class="muted">参数使用 mm、rad 和无量纲数值，可供尺寸表达式引用。</p><div v-for="parameter in doc.parameters" :key="parameter.id" class="param"><input v-model="parameter.name"><input v-model="parameter.expression"><b>{{ parameter.value }}</b></div><button class="wide" @click="doc.parameters.push({id:modelingId('parameter'),name:`参数${doc.parameters.length+1}`,expression:'10 mm',quantity:'length',value:10});store.finish('添加参数')">添加参数</button></div>
      </aside>
    </div>

    <footer class="status"><span><MousePointer2 :size="14"/>{{ cursorLabel }}</span><label>单位 <select v-model="doc.displayLengthUnit"><option value="mm">mm</option><option value="cm">cm</option><option value="m">m</option></select></label><button :class="{active:doc.preferences.snapGrid}" @click="doc.preferences.snapGrid=!doc.preferences.snapGrid">网格吸附</button><button :class="{active:doc.preferences.snapObjects}" @click="doc.preferences.snapObjects=!doc.preferences.snapObjects">对象吸附</button><button :class="{active:doc.preferences.snapAngle}" @click="doc.preferences.snapAngle=!doc.preferences.snapAngle">角度追踪</button><button :class="{active:doc.preferences.autoConstraint}" @click="doc.preferences.autoConstraint=!doc.preferences.autoConstraint">自动约束</button><i></i><span>{{ entities.length }} 个对象</span><span>{{ store.closedProfiles }} 个轮廓</span><span>{{ doc.constraints.length }} 个约束</span></footer>
  </section>
</template>

<style scoped>
.modeler{--blue:#1677b8;--soft:#eaf5fb;--line:#d7e0e7;--ink:#12212d;--muted:#687986;display:flex;flex-direction:column;height:calc(100vh - 130px);min-height:720px;max-height:980px;background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;color:var(--ink);box-shadow:0 18px 48px rgba(24,55,76,.08)}button,input,select{font:inherit}.topbar{height:48px;display:grid;grid-template-columns:1fr minmax(220px,400px) 1fr;align-items:center;padding:0 11px;border-bottom:1px solid var(--line);background:#fafcfd}.file-actions{display:flex;gap:3px;align-items:center}.file-actions.exports{justify-content:flex-end}.file-actions button,.panel-head>button,.canvas-tools button{height:34px;border:0;border-radius:8px;background:transparent;display:flex;align-items:center;gap:5px;padding:0 9px;cursor:pointer}.file-actions button:hover,.panel-head>button:hover,.canvas-tools button:hover{background:var(--soft);color:var(--blue)}.file-actions .continue{background:var(--blue);color:#fff}.file-actions .continue:hover{background:#0f679f;color:#fff}button:disabled{opacity:.35;cursor:not-allowed}.file-actions i{height:22px;width:1px;background:var(--line);margin:0 5px}.title{text-align:center}.title input{width:100%;border:0;background:transparent;text-align:center;font-size:15px;font-weight:700;outline:0}.title small{display:block;color:#68907a;font-size:10px}.ribbon{min-height:76px;display:flex;align-items:stretch;padding:7px 9px;border-bottom:1px solid var(--line);overflow-x:auto}.tools{display:flex;align-items:center;flex:0 0 auto;gap:2px}.tools button{position:relative;min-width:50px;height:60px;border:1px solid transparent;border-radius:8px;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:10px;cursor:pointer}.tools button:hover,.tools button.active{border-color:#bfdeed;background:var(--soft);color:var(--blue)}.tools button.delete:hover{color:#c43b45;background:#fff0f1}.tools button b{font-size:20px;line-height:18px}.tools button sup{position:absolute;right:4px;top:3px;border-radius:9px;background:#d74752;color:#fff;padding:0 4px}.rule{width:1px;background:var(--line);margin:4px 8px}.inline-input{width:63px;display:flex;flex-direction:column;align-items:center}.inline-input input{box-sizing:border-box;width:59px;height:27px;border:1px solid var(--line);border-radius:6px;text-align:center}.inline-input em{font-size:9px;font-style:normal;color:var(--muted)}
.workspace{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:220px minmax(0,1fr) 280px}.workspace.leftClosed{grid-template-columns:0 minmax(0,1fr) 280px}.workspace.rightClosed{grid-template-columns:220px minmax(0,1fr) 0}.workspace.leftClosed.rightClosed{grid-template-columns:0 minmax(0,1fr) 0}.left-panel,.right-panel{min-width:0;overflow:hidden;background:#fafcfd}.left-panel{border-right:1px solid var(--line)}.right-panel{border-left:1px solid var(--line)}.panel-head{height:43px;display:flex;align-items:center;justify-content:space-between;padding:0 7px 0 11px;border-bottom:1px solid var(--line);font-size:13px;font-weight:700}.panel-head>span{display:flex;align-items:center;gap:6px}.tree-block{padding:9px 7px;border-bottom:1px solid var(--line)}.tree-block h4{display:flex;justify-content:space-between;margin:0;padding:0 5px 7px;color:var(--muted);font-size:11px;font-weight:500}.tree-block h4 em,.tree-row em{font-style:normal}.tree-item{width:100%;height:34px;border:0;border-radius:7px;background:transparent;display:grid;grid-template-columns:18px 1fr 20px 20px;align-items:center;text-align:left;padding:0 6px;font-size:12px;cursor:pointer}.tree-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tree-item i{display:grid;place-items:center;font-style:normal}.tree-item:hover,.tree-item.selected{background:var(--soft);color:var(--blue)}.tree-empty{text-align:center;padding:25px 5px;color:#94a3ad;font-size:13px}.tree-row{height:31px;display:grid;grid-template-columns:19px 1fr auto;align-items:center;font-size:12px;padding:0 6px}.tree-row em{font-size:10px;color:var(--muted)}.group-form{display:grid;grid-template-columns:1fr 46px;gap:5px;margin-top:7px}.group-form input,.group-form button{min-width:0;height:30px;border:1px solid var(--line);border-radius:6px;background:#fff;padding:0 6px}.group-form button{color:var(--blue)}
.canvas-shell{position:relative;overflow:hidden}.canvas{display:block;width:100%;height:100%;min-height:480px;touch-action:none;cursor:crosshair}.grid line{stroke:#edf1f4;stroke-width:.5;vector-effect:non-scaling-stroke}.axes line{stroke:#b6c3cc;stroke-width:1;vector-effect:non-scaling-stroke}.entity{stroke:#207caf;stroke-width:1.7;vector-effect:non-scaling-stroke;pointer-events:stroke;cursor:pointer}.entity.closed{fill:rgba(80,160,205,.035)}.entity.construction{stroke:#8d9da7;stroke-dasharray:6 4}.entity.hovered{stroke:#ef7b32;stroke-width:2.8}.entity.selected{stroke:#0874bd;stroke-width:3}.entity.locked{stroke-dasharray:4 3}.entity.dot{fill:#207caf;pointer-events:all}.draft path{fill:none;stroke:#ee7731;stroke-width:1.7;stroke-dasharray:6 4;vector-effect:non-scaling-stroke}.draft circle{fill:#fff;stroke:#ee7731;vector-effect:non-scaling-stroke}.selection{fill:rgba(44,135,190,.09);stroke:#277fad;vector-effect:non-scaling-stroke}.selection.crossing{fill:rgba(81,178,129,.1);stroke:#318b60;stroke-dasharray:5 4}.handles circle{fill:#fff;stroke:#0874bd;stroke-width:1.5;vector-effect:non-scaling-stroke}.canvas-tools{position:absolute;z-index:3;left:11px;top:10px;display:flex;padding:3px;border:1px solid var(--line);border-radius:9px;background:rgba(255,255,255,.93)}.canvas-tools button.active{background:var(--soft);color:var(--blue)}.hint{position:absolute;left:50%;bottom:11px;transform:translateX(-50%);max-width:78%;display:flex;gap:12px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.94);color:var(--muted);font-size:12px;white-space:nowrap}.hint strong{color:var(--blue);font-weight:500}.open-panel{position:absolute;z-index:5;top:50%;width:27px;height:48px;border:1px solid var(--line);background:#fff;color:var(--blue)}.open-panel.left{left:0;border-radius:0 8px 8px 0}.open-panel.right{right:0;border-radius:8px 0 0 8px}
.tabs{display:flex;height:100%}.tabs button{height:100%;border:0;border-bottom:2px solid transparent;background:transparent;font-size:12px}.tabs button.active{color:var(--blue);border-bottom-color:var(--blue)}.tabs b{padding:0 4px;border-radius:8px;background:#d74752;color:#fff}.panel-body{height:calc(100% - 44px);box-sizing:border-box;overflow-y:auto;padding:13px}.panel-body h3{display:flex;justify-content:space-between;margin:0 0 15px;font-size:14px}.panel-body h3 small{color:var(--muted);font-weight:400}.panel-body label{display:flex;flex-direction:column;gap:5px;margin-bottom:10px;color:var(--muted);font-size:11px}.panel-body input{box-sizing:border-box;width:100%;height:35px;border:1px solid var(--line);border-radius:7px;background:#fff;padding:0 8px}.two{display:grid;grid-template-columns:1fr 1fr;gap:7px}.metrics{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:12px 0}.metrics div{padding:9px;border-radius:7px;background:#edf5f8}.metrics small{display:block;color:var(--muted);font-size:10px}.metrics strong{display:block;margin-top:3px;font-size:11px}.toggles{display:flex;gap:6px}.toggles button,.wide{height:34px;border:1px solid var(--line);border-radius:7px;background:#fff;padding:0 9px}.toggles button.active,.wide:hover{background:var(--soft);color:var(--blue)}.constraint-item{width:100%;height:31px;border:0;border-radius:6px;background:#edf5f8;display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}.muted{color:var(--muted);font-size:11px;line-height:1.6}.empty,.healthy{min-height:250px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#93a3ad}.empty strong,.healthy strong{margin-top:10px;color:#50636f}.empty p,.healthy p{font-size:12px}.checks>button{width:100%;display:flex;gap:8px;text-align:left;padding:9px;margin-bottom:7px;border:1px solid var(--line);border-radius:8px;background:#fff}.checks>button.error{color:#ae3440;background:#fff7f7;border-color:#ecc3c7}.checks>button.warning{color:#956323;background:#fffaf2;border-color:#ecd7b8}.checks>button span{display:flex;flex-direction:column;font-size:11px}.param{display:grid;grid-template-columns:1fr 1.1fr 35px;gap:4px;margin-bottom:5px}.param input{height:31px}.param b{display:grid;place-items:center;font-size:10px}.wide{width:100%}
.status{min-height:34px;display:flex;align-items:center;gap:11px;padding:0 11px;border-top:1px solid var(--line);background:#f8fafb;color:var(--muted);font-size:11px;white-space:nowrap;overflow-x:auto}.status span,.status label{display:flex;align-items:center;gap:4px}.status select{border:0;background:transparent;color:inherit}.status button{height:24px;border:0;border-radius:5px;background:transparent;color:inherit}.status button.active{background:#dceef7;color:var(--blue)}.status>i{flex:1}
@media(max-width:1279px){.workspace{grid-template-columns:210px minmax(0,1fr) 0}.right-panel{display:none}.workspace.rightClosed,.workspace.leftClosed.rightClosed{grid-template-columns:210px minmax(0,1fr) 0}.workspace.leftClosed{grid-template-columns:0 minmax(0,1fr) 0}.constraints{display:none}.file-actions button span{display:none}}
@media(max-width:899px){.modeler{height:calc(100vh - 80px);min-height:620px;border-radius:0}.exports{display:flex}.exports button:not(.continue),.exports i{display:none}.topbar{grid-template-columns:auto 1fr auto}.ribbon{min-height:65px}.tools button{height:51px;min-width:47px}.workspace,.workspace.leftClosed,.workspace.rightClosed,.workspace.leftClosed.rightClosed{grid-template-columns:0 minmax(0,1fr) 0}.left-panel,.right-panel{display:block;position:absolute;z-index:8;top:0;bottom:0;width:min(86vw,300px);transition:transform .2s}.left-panel{left:0}.right-panel{right:0}.leftClosed .left-panel{transform:translateX(-105%)}.rightClosed .right-panel{transform:translateX(105%)}.hint strong{display:none}.status span:nth-last-child(-n+3){display:none}}
</style>
