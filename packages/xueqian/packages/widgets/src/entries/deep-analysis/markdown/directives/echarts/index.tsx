import React, { useCallback, useEffect, useRef, useState } from "react";
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from "echarts/core";
// 引入柱状图图表，图表后缀都为 Chart
import { BarChart, LineChart, PieChart } from "echarts/charts";
// 引入标题，提示框，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
} from "echarts/components";
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from "echarts/features";
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from "echarts/renderers";
import { EChartsCitationDirective } from "./citation";
import { merge } from "lodash-es";

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  PieChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

export function EChartsDirective(props) {
  const [options, setOptions] = useState<any>(null);
  const [sources, setSources] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const getOptions = useCallback(async (id: string) => {
    try {
      console.log("getOptions", id);
      const resp = await fetch(
        `${window.location.origin}/ai-agent/chart-options`,
        {
          headers: {},
          method: "POST",
          body: JSON.stringify({
            id,
          }),
        }
      );

      if (resp.ok) {
        const info = await resp.json();
        // setResult(info);
        console.log(typeof info);
        setOptions(
          merge(
            {
              title: {
                textStyle: {
                  fontSize: 12,
                },
              },
              xAxis: {
                nameTextStyle: {
                  fontSize: 0,
                },
              },
            },
            info.chartOptions
          )
        );
        setSources(info.queryIds || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    getOptions(props.id);
  }, [props.id]);

  useEffect(() => {
    if (!options) {
      return;
    }
    const myChart = echarts.init(ref.current);
    myChart.setOption({
      yAxis: {},
      tooltip: {
        show: true,
      },
      ...options,
    });

    return () => {
      myChart.dispose();
    };
  }, [options]);

  return (
    <div>
      <div
        className="my-3 relative border border-gray-200 rounded"
        style={{ paddingBottom: "100%" }}
      >
        <div
          className="chart-container absolute top-0 left-0 w-full h-full"
          ref={ref}
        />
      </div>
      {sources.length > 0 && <EChartsCitationDirective ids={sources} />}
    </div>
  );
}
