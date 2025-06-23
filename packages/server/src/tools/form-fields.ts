import { formFetch } from "../lib/request/form.js";
import { z } from "zod";

const columnsFormatter = [
  {
    reg: /^number_/i,
    format: ({ id, props }) => {
      return {
        column_name: id,
        data_type: "INT",
        display_name: props.label || "",
      };
    },
  },
  {
    reg: /^select_/i,
    format: ({ id, props }) => {
      return {
        column_name: id,
        data_type: "ENUM",
        enum_values: (props.options || []).map((item) => item.label),
        display_name: props.label || "",
      };
    },
  },
  {
    reg: /^selectdd_/i,
    format: ({ id, props }) => {
      return {
        column_name: id,
        data_type: "JSON",
        display_name: props.label || "",
        comment: `ENUM ARRAY, available enums is: ${JSON.stringify(
          (props.options || []).map((item) => item.label)
        )}`,
      };
    },
  },
  {
    reg: /^people_/i,
    format: ({ id, props }) => {
      return {
        column_name: id,
        data_type: "VARCHAR",
        display_name: props.label || "",
      };
    },
  },
  {
    reg: /^date_/i,
    format: ({ id, props }) => {
      return {
        column_name: id,
        data_type: "TIMESTAMP",
        display_name: props.label || "",
      };
    },
  },
  {
    reg: /^textarea_/i,
    format: ({ id, props }) => {
      return {
        column_name: id,
        data_type: "TEXT",
        display_name: props.label || "",
      };
    },
  },
  {
    reg: /^money_/i,
    format: ({ id, props }) => {
      return {
        column_name: id,
        data_type: "DECIMAL",
        display_name: props.label || "",
      };
    },
  },
  {
    reg: /^department_/i,
    format: ({ id, props }) => {
      return {
        column_name: id,
        data_type: "VARCHAR",
        display_name: props.label || "",
      };
    },
  },
];

const SYSTEM_FIELDS: Record<string, any>[] = [
  {
    column_name: "SYSTEM_CREATOR",
    display_name: "创建人",
    data_type: "VARCHAR",
  },
  {
    column_name: "SYSTEM_DATE_CREATED",
    display_name: "创建时间",
    data_type: "TIMESTAMP",
  },
];

export const getFormFields = async (ctx: any) => {
  const result = await formFetch(ctx).get<{
    name: string;
    schema: string;
    showFields: string[];
  }>(`/api/zeroconsole/view/showInfo/${ctx.view}`);
  const { name, schema, showFields } = result;
  const schemaObj = JSON.parse(schema);
  const fields = [...SYSTEM_FIELDS];
  const walk = (field: any) => {
    if (field.parentInstanceKey) {
      const formatter = columnsFormatter.find((item) =>
        item.reg.test(field.id)
      );
      if (formatter) {
        fields.push(formatter.format(field));
      } else {
        fields.push({
          column_name: field.id,
          display_name: field.props.label || "",
          data_type: "VARCHAR",
        });
      }
    }
    if (field.children) {
      field.children.forEach(walk);
    }
  };

  walk(schemaObj.pages[0].layout);

  return {
    description: name,
    columns: showFields
      .map((item) => fields.find((field) => field.column_name === item))
      .filter(Boolean),
  };
};

export const getFormFieldsToolFactory = (ctx: any) => {
  return {
    id: "get-table-columns",
    description: "Get the table columns",
    parameters: z.object({}),
    async execute(_, { toolCallId }) {
      try {
        ctx.stream?.appendMessageAnnotation({
          type: "tool-status",
          toolCallId,
          status: "in-progress",
        });

        const result = await getFormFields(ctx);
        return {
          content: [
            {
              type: "text",
              text: `Current table info:
---
${JSON.stringify(result)}
---
`,
            },
          ],
        };
      } catch (e) {
        console.log(e);
        return {
          content: {
            type: "text",
            text: "Failed to get table columns",
          },
          isError: true,
        };
      }
    },
  };
};
