import { Component, h, Prop, State, Watch, Fragment } from '@stencil/core';
import {
    KupPlannerBarMoveAction,
    KupPlannerGanttContentMoveAction,
    KupPlannerGanttEvent,
    KupPlannerBarDateHandleProps,
    KupPlannerBarDisplayProps,
    KupPlannerBarTask,
    KupPlannerEventOption,
    KupPlannerTaskGanttContentProps,
    KupPlannerTaskGanttProps,
    KupPlannerTaskItemProps,
    KupPlannerTaskIconProps,
} from '../../kup-planner-declarations';
import { addToDate } from '../kup-planner-renderer-helper';
import {
    handleTaskBySVGMouseEvent,
    getProgressPoint,
} from '../helpers/bar.helpers';
import { isKeyboardEvent } from '../helpers/other.helpers';
import { hexToCSSFilter } from 'hex-to-css-filter';
@Component({
    tag: 'kup-grid-renderer',
    styleUrl: 'kup-grid-renderer.scss',
    shadow: false, // Enable Shadow DOM
})
export class KupGridRenderer {
    /*-------------------------------------------------*/
    /*                    P r o p s                    */
    /*-------------------------------------------------*/

    @Prop()
    tasks: KupPlannerTaskGanttContentProps['tasks'];

    @Prop()
    dates: KupPlannerTaskGanttContentProps['dates'];

    @Prop()
    ganttEvent: KupPlannerTaskGanttContentProps['ganttEvent'];

    @Prop()
    selectedTask: KupPlannerTaskGanttContentProps['selectedTask'];

    @Prop()
    rowHeight: KupPlannerTaskGanttContentProps['rowHeight'] = 0;

    @Prop()
    columnWidth: KupPlannerTaskGanttContentProps['columnWidth'] = 0;

    @Prop()
    timeStep: KupPlannerTaskGanttContentProps['timeStep'] = 0;

    @Prop()
    taskHeight: KupPlannerTaskGanttContentProps['taskHeight'] = 0;

    @Prop()
    arrowColor: KupPlannerTaskGanttContentProps['arrowColor'] = '';

    @Prop()
    arrowIndent: KupPlannerTaskGanttContentProps['arrowIndent'] = 0;

    @Prop()
    fontFamily: KupPlannerTaskGanttContentProps['fontFamily'] = '';

    @Prop()
    fontSize: KupPlannerTaskGanttContentProps['fontSize'] = '';

    @Prop()
    rtl: KupPlannerTaskGanttContentProps['rtl'] = false;

    @Prop()
    hideLabel?: KupPlannerTaskGanttContentProps['hideLabel'] = false;

    @Prop()
    showSecondaryDates?: KupPlannerTaskGanttContentProps['showSecondaryDates'] =
        false;

    @Prop()
    currentDateIndicator?: KupPlannerTaskGanttContentProps['currentDateIndicator'];

    @Prop()
    projection?: KupPlannerTaskGanttContentProps['projection'];

    @Prop()
    readOnly: KupPlannerTaskGanttContentProps['readOnly'] = false;

    @Prop()
    gridProps: KupPlannerTaskGanttProps['gridProps'];

    // Event Emitters for custom events
    @Prop()
    dateChange: KupPlannerEventOption['dateChange'];

    @Prop()
    progressChange: KupPlannerEventOption['progressChange'];

    @Prop()
    doubleClick: KupPlannerEventOption['doubleClick'];

    @Prop()
    barClick: KupPlannerEventOption['barClick'];

    @Prop()
    barDblClick: KupPlannerEventOption['barDblClick'];

    @Prop()
    barContextMenu: KupPlannerEventOption['barContextMenu'];

    @Prop()
    delete: KupPlannerEventOption['delete'];

    @Prop()
    setFailedTask: KupPlannerTaskGanttContentProps['setFailedTask'];

    @Prop()
    setSelectedTask: KupPlannerTaskGanttContentProps['setSelectedTask'];

    @Prop()
    eventStart: KupPlannerTaskItemProps['onEventStart'];

    @Prop()
    eMouseDown: KupPlannerBarDisplayProps['onMouseDown'];

    @Prop({ mutable: true })
    setGanttEvent: (gantt: KupPlannerGanttEvent) => void;

    /*-------------------------------------------------*/
    /*                   S t a t e s                   */
    /*-------------------------------------------------*/
    @State()
    xStep: number = 0;

    @State()
    initEventX1Delta: number = 0;

    @State()
    initEventXClick: number = 0;

    @State()
    isMoving: boolean = false;

    @State()
    point: SVGPoint;

    @State()
    svg: SVGSVGElement;

    //---- Lifecycle hooks ----

    componentDidLoad() {
        this.point = this.createSVGPoint();
        this.updateXStep();
    }

    createSVGPoint(): SVGPoint | undefined {
        if (this.svg) {
            return this.svg.createSVGPoint();
        }
        return undefined;
    }

    /*-------------------------------------------------*/
    /*                   W A T C H E R S               */
    /*-------------------------------------------------*/

    @Watch('columnWidth')
    @Watch('dates')
    @Watch('timeStep')
    updateXStep() {
        // Calculate xStep whenever columnWidth, dates, or timeStep props change
        const dateDelta =
            this.dates[1].getTime() -
            this.dates[0].getTime() -
            this.dates[1].getTimezoneOffset() * 60 * 1000 +
            this.dates[0].getTimezoneOffset() * 60 * 1000;
        const newXStep = (this.timeStep * this.columnWidth) / dateDelta;
        this.xStep = newXStep;
    }

    @Watch('ganttEvent')
    @Watch('xStep')
    @Watch('timeStep')
    @Watch('svg')
    @Watch('initEventX1Delta')
    @Watch('point')
    @Watch('rtl')
    @Watch('onProgressChange')
    @Watch('onDateChange')
    updateSvgMove() {
        const handleMouseMove = async (event: MouseEvent) => {
            if (!this.ganttEvent.changedTask || !this.point || !this.svg)
                return;
            event.preventDefault();
            this.point.x = event.clientX;
            const cursor = this.point.matrixTransform(
                this.svg?.getScreenCTM()?.inverse()
            );
            const { isChanged, changedTask } = handleTaskBySVGMouseEvent(
                cursor.x,
                this.ganttEvent.action as KupPlannerBarMoveAction,
                this.ganttEvent.changedTask,
                this.xStep,
                this.timeStep,
                this.initEventX1Delta,
                this.rtl
            );
            if (isChanged) {
                this.setGanttEvent({
                    ...this.ganttEvent,
                    action: this.ganttEvent.action,
                    changedTask,
                });
            }
        };

        const handleMouseUp = async (event: MouseEvent) => {
            const { action, originalSelectedTask, changedTask } =
                this.ganttEvent;
            if (
                !changedTask ||
                !this.point ||
                !this.svg ||
                !originalSelectedTask
            )
                return;
            event.preventDefault();

            this.point.x = event.clientX;
            const cursor = this.point.matrixTransform(
                this.svg?.getScreenCTM()?.inverse()
            );
            const { changedTask: newChangedTask } = handleTaskBySVGMouseEvent(
                cursor.x,
                action as KupPlannerBarMoveAction,
                changedTask,
                this.xStep,
                this.timeStep,
                this.initEventX1Delta,
                this.rtl
            );

            const isNotLikeOriginal =
                originalSelectedTask.start !== newChangedTask.start ||
                originalSelectedTask.end !== newChangedTask.end ||
                originalSelectedTask.progress !== newChangedTask.progress;

            // remove listeners
            this.svg.removeEventListener('mousemove', handleMouseMove);
            this.svg.removeEventListener('mouseup', handleMouseUp);
            this.setGanttEvent({ action: '' });
            this.isMoving = false;

            // custom operation start
            let operationSuccess: any = true;
            if (
                (action === 'move' || action === 'end' || action === 'start') &&
                this.dateChange &&
                isNotLikeOriginal
            ) {
                try {
                    const result = await this.dateChange(
                        newChangedTask,
                        newChangedTask.barChildren
                    );
                    if (result !== undefined) {
                        operationSuccess = result;
                    }
                } catch (error) {
                    operationSuccess = false;
                }
            } else if (this.progressChange && isNotLikeOriginal) {
                try {
                    const result = this.progressChange(
                        newChangedTask,
                        newChangedTask.barChildren
                    );
                    if (result !== undefined) {
                        operationSuccess = result;
                    }
                } catch (error) {
                    operationSuccess = false;
                }
            }

            // If operation is failed - return old state
            if (!operationSuccess) {
                this.setFailedTask(originalSelectedTask);
            }
        };

        if (
            !this.isMoving &&
            (this.ganttEvent.action === 'move' ||
                this.ganttEvent.action === 'end' ||
                this.ganttEvent.action === 'start' ||
                this.ganttEvent.action === 'progress') &&
            this.svg
        ) {
            this.svg.addEventListener('mousemove', handleMouseMove);
            this.svg.addEventListener('mouseup', handleMouseUp);
            this.isMoving = true;
        }
    }

    hasMovedHorizontally(event: MouseEvent): boolean {
        if (this.readOnly) {
            return false;
        }
        return this.initEventXClick !== event.clientX;
    }

    handleBarEventStart(
        action: KupPlannerGanttContentMoveAction,
        task: KupPlannerBarTask,
        event?: MouseEvent | KeyboardEvent
    ) {
        if (!event) {
            if (action === 'select') {
                this.setSelectedTask(task.id);
            }
        } else if (isKeyboardEvent(event)) {
            if (action === 'delete') {
                if (this.delete) {
                    try {
                        const result = this.delete(task);
                        if (result !== undefined && result) {
                            this.setGanttEvent({ action, changedTask: task });
                            // this.ganttEvent = { action, changedTask: task }
                        }
                    } catch (error) {
                        console.error('Error on Delete. ' + error);
                    }
                }
            }
        } else if (action === 'mouseenter') {
            if (!this.ganttEvent.action) {
                this.setGanttEvent({
                    action,
                    changedTask: task,
                    originalSelectedTask: task,
                });
            }
        } else if (action === 'mouseleave') {
            if (this.ganttEvent.action === 'mouseenter') {
                this.setGanttEvent({
                    action: '',
                });
            }
        } else if (action === 'dblclick') {
            this.doubleClick && this.doubleClick(task);
        } else if (action === 'click') {
            const skipClick = this.hasMovedHorizontally(event);
            !skipClick && this.barClick && this.barClick(task);
        } else if (action === 'contextmenu') {
            event.preventDefault();
            this.barContextMenu && this.barContextMenu(event, task);
        } else if (action === 'move') {
            if (!this.svg || !this.point) return;
            this.point.x = event.clientX;
            const cursor = this.point.matrixTransform(
                this.svg.getScreenCTM()?.inverse()
            );
            this.initEventX1Delta = cursor.x - task.x1;
            this.initEventXClick = event.clientX;
            this.setGanttEvent({
                action,
                changedTask: task,
                originalSelectedTask: task,
            });
        } else {
            this.setGanttEvent({
                action,
                changedTask: task,
                originalSelectedTask: task,
            });
        }
    }

    getTaskIcon(bar: KupPlannerTaskIconProps) {
        const cssFilter = hexToCSSFilter(bar.color);
        return (
            <image
                href={bar.url}
                filter={cssFilter.filter.replace(';', '')}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
            ></image>
        );
    }

    renderKupBar(
        task: KupPlannerBarTask,
        isSelected: boolean,
        isDateResizable: boolean,
        isProgressChangeable: boolean
    ) {
        return (
            <g class="barWrapper" tab-index={0}>
                {this.renderKupBarDisplay(
                    task.x1,
                    task.y,
                    task.x2 - task.x1,
                    task.height,
                    task.progressX,
                    task.progressWidth,
                    task.barCornerRadius,
                    task.styles,
                    isSelected,
                    !this.readOnly && !!this.dateChange && !task.isDisabled,
                    task,
                    task.x1secondary,
                    (task.x2secondary ?? 0) - (task.x1secondary ?? 0)
                )}
                <g class="handleGroup">
                    {isDateResizable && (
                        <g>
                            {/* left */}
                            {this.renderKupBarDateHandle(
                                task.x1 + 1,
                                task.y + 1,
                                task.handleWidth,
                                task.height - 2,
                                task.barCornerRadius,
                                task,
                                'start'
                            )}
                            {/* right */}
                            {this.renderKupBarDateHandle(
                                task.x2 - task.handleWidth - 1,
                                task.y + 1,
                                task.handleWidth,
                                task.height - 2,
                                task.barCornerRadius,
                                task,
                                'end'
                            )}
                        </g>
                    )}
                    {isProgressChangeable && (
                        <polygon
                            class="barHandle"
                            points={this.calculateProgressPoint(task)}
                            onMouseDown={(e) => {
                                this.handleBarEventStart('progress', task, e);
                            }}
                        />
                    )}
                </g>
                {task.icon &&
                    task.icon.url &&
                    this.getTaskIcon({
                        color: task.icon.color ?? '#000000',
                        url: task.icon.url,
                        width: task.height / 2 + 'px',
                        height: task.height / 2 + 'px',
                        x: task.x1 + (task.x2 - task.x1) - task.height / 2 / 2,
                        y:
                            task.y -
                            task.height / 2 / 2 / 2 +
                            (this.showSecondaryDates ? task.height / 2 : 0),
                    })}
            </g>
        );
    }

    renderKupBarDisplay(
        x: KupPlannerBarDisplayProps['x'],
        y: KupPlannerBarDisplayProps['y'],
        width: KupPlannerBarDisplayProps['width'],
        height: KupPlannerBarDisplayProps['height'],
        progressX: KupPlannerBarDisplayProps['progressX'],
        progressWidth: KupPlannerBarDisplayProps['progressWidth'],
        barCornerRadius: KupPlannerBarDisplayProps['barCornerRadius'],
        styles: KupPlannerBarDisplayProps['styles'],
        isSelected: KupPlannerBarDisplayProps['isSelected'],
        isDateMovable: KupPlannerTaskItemProps['isDateMovable'],
        task: KupPlannerBarTask,
        xSecondary?: KupPlannerBarDisplayProps['xSecondary'],
        widthSecondary?: KupPlannerBarDisplayProps['widthSecondary']
    ) {
        if (this.showSecondaryDates && typeof xSecondary !== 'undefined') {
            const halfHeight = height / 2;
            return (
                <g
                    onMouseDown={(e) =>
                        isDateMovable &&
                        this.handleBarEventStart('move', task, e)
                    }
                >
                    <rect
                        key="top semi-transparent bar"
                        x={xSecondary}
                        width={widthSecondary}
                        y={y}
                        height={halfHeight}
                        ry={barCornerRadius}
                        rx={barCornerRadius}
                        fill={this.getBarColor(isSelected, styles)}
                        opacity={0.5}
                        class={'barBackground'}
                    />
                    <rect
                        key="main bar"
                        x={x}
                        width={width}
                        y={y + halfHeight}
                        height={halfHeight}
                        ry={barCornerRadius}
                        rx={barCornerRadius}
                        fill={this.getBarColor(isSelected, styles)}
                        class={'barBackground'}
                    />
                    <rect
                        key="progress bar"
                        x={progressX}
                        width={progressWidth}
                        y={y + halfHeight}
                        height={halfHeight}
                        ry={barCornerRadius}
                        rx={barCornerRadius}
                        fill={this.getProcessColor(isSelected, styles)}
                    />
                </g>
            );
        }

        return (
            <g
                onMouseDown={(e) => {
                    isDateMovable && this.handleBarEventStart('move', task, e);
                }}
            >
                <rect
                    x={x}
                    width={width}
                    y={y}
                    height={height}
                    ry={barCornerRadius}
                    rx={barCornerRadius}
                    fill={this.getBarColor(isSelected, styles)}
                    class={'barBackground'}
                />
                <rect
                    x={progressX}
                    width={progressWidth}
                    y={y}
                    height={height}
                    ry={barCornerRadius}
                    rx={barCornerRadius}
                    fill={this.getProcessColor(isSelected, styles)}
                />
            </g>
        );
    }

    renderKupBarDateHandle(
        x: KupPlannerBarDateHandleProps['x'],
        y: KupPlannerBarDateHandleProps['y'],
        width: KupPlannerBarDateHandleProps['width'],
        height: KupPlannerBarDateHandleProps['height'],
        barCornerRadius: KupPlannerBarDateHandleProps['barCornerRadius'],
        task: KupPlannerBarTask,
        eventType: KupPlannerGanttContentMoveAction
    ) {
        return (
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                class={'barHandle'}
                ry={barCornerRadius}
                rx={barCornerRadius}
                onMouseDown={(e) =>
                    this.handleBarEventStart(eventType, task, e)
                }
            />
        );
    }

    renderKupBarSmall(
        task: KupPlannerBarTask,
        isSelected: boolean,
        isDateMovable: boolean,
        isProgressChangeable: boolean
    ) {
        return (
            <g class={'barWrapper'} tab-index={0}>
                {this.renderKupBarDisplay(
                    task.x1,
                    task.y,
                    task.x2 - task.x1,
                    task.height,
                    task.progressX,
                    task.progressWidth,
                    task.barCornerRadius,
                    task.styles,
                    isSelected,
                    isDateMovable,
                    task
                )}
                <g class="handleGroup">
                    {isProgressChangeable && (
                        <polygon
                            class={'barHandle'}
                            points={this.calculateProgressPoint(task, 'small')}
                            onMouseDown={(e) => {
                                this.handleBarEventStart('progress', task, e);
                            }}
                        />
                    )}
                </g>
            </g>
        );
    }

    renderKupBarTimeLine(task: KupPlannerBarTask, col: string) {
        return (
            <g tab-index={0}>
                <rect
                    fill={col}
                    x="0"
                    width="100%"
                    y={task.y}
                    height={task.height}
                    rx={0}
                    ry={0}
                />
                {task.barChildren.map((bar) => {
                    return (
                        <Fragment>
                            <rect
                                style={{ cursor: 'pointer' }}
                                key={bar.id}
                                fill={bar.styles.backgroundColor}
                                x={bar.x1}
                                width={bar.x2 - bar.x1}
                                y={bar.y}
                                height={bar.height}
                                rx={bar.barCornerRadius}
                                ry={bar.barCornerRadius}
                            />
                            {bar.icon &&
                                bar.icon.url &&
                                this.getTaskIcon({
                                    color: bar.icon.color ?? '#000000',
                                    url: bar.icon.url,
                                    width: bar.height + 'px',
                                    height: bar.height + 'px',
                                    x:
                                        bar.x1 +
                                        (bar.x2 - bar.x1) -
                                        bar.height / 2,
                                    y: bar.y - bar.height / 2 / 2,
                                })}
                        </Fragment>
                    );
                })}
            </g>
        );
    }

    renderKupArrow(task: KupPlannerBarTask, child: KupPlannerBarTask) {
        const [path, trianglePoints] = this.rtl
            ? this.drownPathAndTriangleRTL(
                  task,
                  this.tasks[child.index],
                  this.rowHeight,
                  this.taskHeight,
                  this.arrowIndent
              )
            : this.drownPathAndTriangle(
                  task,
                  this.tasks[child.index],
                  this.rowHeight,
                  this.taskHeight,
                  this.arrowIndent
              );
        return (
            <g class="arrow">
                <path stroke-width="1.5" d={path} fill="none" />
                <polygon points={trianglePoints} />
            </g>
        );
    }

    drownPathAndTriangle(
        taskFrom: KupPlannerBarTask,
        taskTo: KupPlannerBarTask,
        rowHeight: number,
        taskHeight: number,
        arrowIndent: number
    ) {
        const indexCompare = taskFrom.index > taskTo.index ? -1 : 1;
        const taskToEndPosition = taskTo.y + taskHeight / 2;
        const taskFromEndPosition = taskFrom.x2 + arrowIndent * 2;
        const taskFromHorizontalOffsetValue =
            taskFromEndPosition < taskTo.x1
                ? ''
                : `H ${taskTo.x1 - arrowIndent}`;
        const taskToHorizontalOffsetValue =
            taskFromEndPosition > taskTo.x1
                ? arrowIndent
                : taskTo.x1 - taskFrom.x2 - arrowIndent;

        const path = `M ${taskFrom.x2} ${taskFrom.y + taskHeight / 2}
        h ${arrowIndent}
        v ${(indexCompare * rowHeight) / 2}
        ${taskFromHorizontalOffsetValue}
        V ${taskToEndPosition}
        h ${taskToHorizontalOffsetValue}`;

        const trianglePoints = `${taskTo.x1},${taskToEndPosition}
        ${taskTo.x1 - 5},${taskToEndPosition - 5}
        ${taskTo.x1 - 5},${taskToEndPosition + 5}`;
        return [path, trianglePoints];
    }

    drownPathAndTriangleRTL(
        taskFrom: KupPlannerBarTask,
        taskTo: KupPlannerBarTask,
        rowHeight: number,
        taskHeight: number,
        arrowIndent: number
    ) {
        const indexCompare = taskFrom.index > taskTo.index ? -1 : 1;
        const taskToEndPosition = taskTo.y + taskHeight / 2;
        const taskFromEndPosition = taskFrom.x1 - arrowIndent * 2;
        const taskFromHorizontalOffsetValue =
            taskFromEndPosition > taskTo.x2
                ? ''
                : `H ${taskTo.x2 + arrowIndent}`;
        const taskToHorizontalOffsetValue =
            taskFromEndPosition < taskTo.x2
                ? -arrowIndent
                : taskTo.x2 - taskFrom.x1 + arrowIndent;

        const path = `M ${taskFrom.x1} ${taskFrom.y + taskHeight / 2}
        h ${-arrowIndent}
        v ${(indexCompare * rowHeight) / 2}
        ${taskFromHorizontalOffsetValue}
        V ${taskToEndPosition}
        h ${taskToHorizontalOffsetValue}`;

        const trianglePoints = `${taskTo.x2},${taskToEndPosition}
        ${taskTo.x2 + 5},${taskToEndPosition + 5}
        ${taskTo.x2 + 5},${taskToEndPosition - 5}`;
        return [path, trianglePoints];
    }

    getBarColor(isSelected: boolean, styles: KupPlannerBarTask['styles']) {
        return isSelected
            ? styles.backgroundSelectedColor
            : styles.backgroundColor;
    }

    getProcessColor(isSelected: boolean, styles: KupPlannerBarTask['styles']) {
        return isSelected ? styles.progressSelectedColor : styles.progressColor;
    }

    calculateProgressPoint(task: KupPlannerBarTask, type: string = 'bar') {
        return getProgressPoint(
            type == 'bar'
                ? +!this.rtl * task.progressWidth + task.progressX
                : task.progressWidth + task.x1,
            task.y,
            task.height
        );
    }

    render() {
        let y = 0;
        const gridRows = [];
        const rowLines = [
            <line
                key="RowLineFirst"
                x1={0}
                y1={0}
                x2={this.gridProps.svgWidth}
                y2={0}
                class="gridRowLine"
            />,
        ];
        for (const task of this.tasks) {
            gridRows.push(
                <rect
                    key={'Row' + task.id}
                    x={0}
                    y={y}
                    width={this.gridProps.svgWidth}
                    height={this.rowHeight}
                    class="gridRow"
                />
            );
            rowLines.push(
                <line
                    key={'RowLine' + task.id}
                    x1={0}
                    y1={y + this.rowHeight}
                    x2={this.gridProps.svgWidth}
                    y2={y + this.rowHeight}
                    class="gridRowLine"
                />
            );
            y += this.rowHeight;
        }

        const now = new Date();
        let tickX = 0;
        const ticks = [];
        for (let i = 0; i < this.dates.length; i++) {
            const date = this.dates[i];
            ticks.push(
                <line
                    key={date.getTime()}
                    x1={tickX}
                    y1={0}
                    x2={tickX}
                    y2={y}
                    class="gridTick"
                />
            );
            if (
                (i + 1 !== this.dates.length &&
                    date.getTime() < now.getTime() &&
                    this.dates[i + 1].getTime() >= now.getTime()) ||
                // if current date is last
                (i !== 0 &&
                    i + 1 === this.dates.length &&
                    date.getTime() < now.getTime() &&
                    addToDate(
                        date,
                        date.getTime() - this.dates[i - 1].getTime(),
                        'millisecond'
                    ).getTime() >= now.getTime())
            ) {
                // Add custom logic here if needed
            }
            tickX += this.columnWidth;
        }
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={this.gridProps.svgWidth}
                height={`${this.rowHeight * this.tasks.length}px`}
                font-family={this.fontFamily}
                ref={(el) => (this.svg = el as SVGSVGElement)}
            >
                <g class="grid">
                    <g class="rows">{gridRows}</g>
                    <g class="rowLines">{rowLines}</g>
                    <g class="ticks">{ticks}</g>
                </g>
                <g class="content">
                    {this.currentDateIndicator && (
                        <rect
                            fill={this.currentDateIndicator.color}
                            x={this.currentDateIndicator.x + 1.5}
                            y="0"
                            width="2"
                            height="100%"
                        />
                    )}
                    {this.projection && (
                        <rect
                            fill={this.projection.color}
                            x={this.projection.x0}
                            y="0"
                            width={this.projection.xf - this.projection.x0}
                            height="100%"
                            fill-opacity="0.35"
                        />
                    )}
                    <g
                        class="arrows"
                        fill={this.arrowColor}
                        stroke={this.arrowColor}
                    >
                        {this.tasks.map((task) => {
                            return task.barChildren.map((child) => {
                                if (task.type !== 'timeline') {
                                    this.renderKupArrow(task, child);
                                }
                            });
                        })}
                    </g>
                    <g
                        class="bar"
                        font-family={this.fontFamily}
                        font-size={this.fontSize}
                    >
                        {this.tasks.map((task) => {
                            const forbidResize = task.type === 'project';
                            return (
                                <g
                                    onKeyDown={(e) => {
                                        switch (e.key) {
                                            case 'Delete': {
                                                if (!task.isDisabled)
                                                    this.handleBarEventStart(
                                                        'delete',
                                                        task,
                                                        e
                                                    );
                                                break;
                                            }
                                        }
                                        e.stopPropagation();
                                    }}
                                    onMouseEnter={(e) => {
                                        this.handleBarEventStart(
                                            'mouseenter',
                                            task,
                                            e
                                        );
                                    }}
                                    onMouseLeave={(e) => {
                                        this.handleBarEventStart(
                                            'mouseleave',
                                            task,
                                            e
                                        );
                                    }}
                                    onDblClick={() => {
                                        this.barDblClick(task);
                                    }}
                                    onClick={(e) => {
                                        this.handleBarEventStart(
                                            'click',
                                            task,
                                            e
                                        );
                                    }}
                                    onContextMenu={(e) => {
                                        this.handleBarEventStart(
                                            'contextmenu',
                                            task,
                                            e
                                        );
                                    }}
                                    onFocus={() => {
                                        this.handleBarEventStart(
                                            'select',
                                            task
                                        );
                                    }}
                                    class="task-wrapper"
                                >
                                    {(() => {
                                        const props = {
                                            task: task,
                                            arrowIndent: this.arrowIndent,
                                            isDelete: !task.isDisabled,
                                            taskHeight: this.taskHeight,
                                            isSelected:
                                                !!this.selectedTask &&
                                                task.id ===
                                                    this.selectedTask.id,
                                            rtl: this.rtl,
                                            hideLabel: this.hideLabel,
                                        };
                                        const styles = task.styles;
                                        const col = props.isSelected
                                            ? styles.backgroundSelectedColor
                                            : styles.backgroundColor;
                                        const isDateResizable =
                                            !this.readOnly &&
                                            !!this.dateChange &&
                                            !task.isDisabled &&
                                            !forbidResize;
                                        const isProgressChangeable =
                                            !this.readOnly &&
                                            !!this.progressChange &&
                                            !task.isDisabled;
                                        const isDateMovable =
                                            !this.readOnly &&
                                            !!this.dateChange &&
                                            !task.isDisabled;
                                        switch (task.typeInternal) {
                                            case 'project':
                                                return this.renderKupBar(
                                                    task,
                                                    props.isSelected,
                                                    isDateResizable,
                                                    isProgressChangeable
                                                );
                                            case 'smalltask':
                                                return this.renderKupBarSmall(
                                                    task,
                                                    props.isSelected,
                                                    isDateMovable,
                                                    isProgressChangeable
                                                );
                                            case 'timeline':
                                                return this.renderKupBarTimeLine(
                                                    task,
                                                    col
                                                );
                                            default:
                                                return this.renderKupBar(
                                                    task,
                                                    props.isSelected,
                                                    isDateResizable,
                                                    isProgressChangeable
                                                );
                                        }
                                    })()}
                                </g>
                            );
                        })}
                    </g>
                </g>
            </svg>
        );
    }
}
