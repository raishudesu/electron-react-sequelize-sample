import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface SettingAttributes {
  key: string;
  value: string;
  updatedAt: Date;
}

interface SettingCreationAttributes
  extends Optional<SettingAttributes, "updatedAt"> {
  key: string;
  value: string;
}

export class Setting
  extends Model<SettingAttributes, SettingCreationAttributes>
  implements SettingAttributes
{
  declare key: string;
  declare value: string;
  declare readonly updatedAt: Date;
}

Setting.init(
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "settings",
    timestamps: false,
  }
);
