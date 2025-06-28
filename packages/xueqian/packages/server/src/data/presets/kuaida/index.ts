import { ToolCacheManager } from "../../../lib/cache/tool.js";
import { formFetch } from "../../../lib/request/form.js";
import { IRunContext } from "../../../types/context";
import {
  IColumnSchema,
  IDataAnalysisPreset,
  IDatabaseSchema,
} from "../../types";

const cacheManager = new ToolCacheManager({
  ttl: 1000 * 60 * 10,
});

// ---
const SYSTEM_FIELDS: IColumnSchema[] = [
  {
    name: "SYSTEM_CREATOR",
    description: "创建人",
    type: "VARCHAR",
    role: "dimension",
  },
  {
    name: "SYSTEM_DATE_CREATED",
    description: "创建时间",
    type: "TIMESTAMP",
    role: "dimension",
  },
];

const columnsFormatter: Array<{
  reg: RegExp;
  format: (data: { id: string; props: Record<string, any> }) => IColumnSchema;
}> = [
  {
    reg: /^number_/i,
    format: ({ id, props }) => {
      return {
        name: id,
        type: "INTEGER",
        description: props?.label || "",
        role: "metric",
      };
    },
  },
  {
    reg: /^select_/i,
    format: ({ id, props }) => {
      return {
        name: id,
        type: "ENUM",
        enum_values: (props.options || [])
          .filter(Boolean)
          .map((item) => item.label),
        description: props?.label || "",
        role: "dimension",
      };
    },
  },
  {
    reg: /^selectdd_/i,
    format: ({ id, props }) => {
      return {
        name: id,
        type: "JSON",
        description: props?.label || "",
        comment: `ENUM ARRAY, available enums is: ${JSON.stringify(
          (props?.options || []).map((item) => item.label)
        )}`,
        role: "dimension",
      };
    },
  },
  {
    reg: /^people_/i,
    format: ({ id, props }) => {
      return {
        name: id,
        type: "VARCHAR",
        description: props?.label || "",
        role: "dimension",
      };
    },
  },
  {
    reg: /^date_/i,
    format: ({ id, props }) => {
      return {
        name: id,
        type: "TIMESTAMP",
        description: props?.label || "",
        role: "dimension",
      };
    },
  },
  {
    reg: /^textarea_/i,
    format: ({ id, props }) => {
      return {
        name: id,
        type: "TEXT",
        description: props?.label || "",
        role: "dimension",
      };
    },
  },
  {
    reg: /^money_/i,
    format: ({ id, props }) => {
      return {
        name: id,
        type: "DECIMAL",
        description: props?.label || "",
        role: "metric",
      };
    },
  },
  {
    reg: /^department_/i,
    format: ({ id, props }) => {
      return {
        name: id,
        type: "VARCHAR",
        description: props?.label || "",
        role: "dimension",
      };
    },
  },
];

const getDataSchema = async (ctx: IRunContext): Promise<IDatabaseSchema> => {
  const cacheKey = {
    view: ctx.view,
  };
  const cache = cacheManager.get(cacheKey);
  let results;
  if (typeof cache !== "undefined") {
    results = cache;
  } else {
    const result = await formFetch(ctx).get<{
      name: string;
      schema: string;
      showFields: string[];
    }>(`/api/zeroconsole/view/showInfo/${ctx.view}`);
    const { name, schema, showFields } = result;
    const schemaObj = JSON.parse(schema);
    const fields = [...SYSTEM_FIELDS];
    const walk = (field: any) => {
      if (!field) {
        return;
      }
      if (field.parentInstanceKey) {
        const formatter = columnsFormatter.find((item) =>
          item.reg.test(field.id)
        );
        if (formatter) {
          fields.push(formatter.format(field));
        } else {
          fields.push({
            name: field.id,
            description: field.props?.label || "",
            type: "VARCHAR",
            role: "dimension",
          });
        }
      }
      if (field.children) {
        field.children.forEach(walk);
      }
    };

    walk(schemaObj.pages[0].layout);

    results = {
      name: ctx.view,
      description: name,
      columns: showFields
        .map((item) => fields.find((field) => field.name === item))
        .filter(Boolean),
    };

    cacheManager.set(cacheKey, results);
  }

  return {
    tables: [results],
  };
};

// ---

export const kuaidaPreset: IDataAnalysisPreset = {
  id: "kuaida",
  description: "快搭表单数据列表",
  prompt: "",
  database_schema: getDataSchema,
  query_executor: "kuaida",
};
