const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const bcrypt = require('bcryptjs');

// Modèle User
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Modèle Template
const Template = sequelize.define('Template', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'templates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Modèle Slide
const Slide = sequelize.define('Slide', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  template_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Template,
      key: 'id'
    }
  },
  slide_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  image_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'slides',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Modèle Field
const Field = sequelize.define('Field', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  template_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Template,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'number', 'date', 'image'),
    defaultValue: 'text'
  },
  default_value: {
    type: DataTypes.TEXT
  },
  position_x: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  position_y: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  width: {
    type: DataTypes.FLOAT,
    defaultValue: 100
  },
  height: {
    type: DataTypes.FLOAT,
    defaultValue: 30
  },
  font_family: {
    type: DataTypes.STRING,
    defaultValue: 'Arial'
  },
  font_size: {
    type: DataTypes.INTEGER,
    defaultValue: 14
  },
  font_color: {
    type: DataTypes.STRING,
    defaultValue: '#000000'
  },
  text_align: {
    type: DataTypes.ENUM('left', 'center', 'right', 'justify'),
    defaultValue: 'left'
  },
  font_style: {
    type: DataTypes.STRING,
    defaultValue: 'normal'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'fields',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Modèle Category
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6'
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: 'folder'
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Modèle Export
const Export = sequelize.define('Export', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  template_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Template,
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_type: {
    type: DataTypes.ENUM('pdf', 'pptx'),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'exports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Modèle TemplateCategory (table de liaison)
const TemplateCategory = sequelize.define('TemplateCategory', {
  template_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Template,
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: 'id'
    }
  }
}, {
  tableName: 'template_categories',
  timestamps: false
});

// Définir les relations
User.hasMany(Template, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Template.belongsTo(User, { foreignKey: 'user_id' });

Template.hasMany(Slide, { foreignKey: 'template_id', onDelete: 'CASCADE' });
Slide.belongsTo(Template, { foreignKey: 'template_id' });

Template.hasMany(Field, { foreignKey: 'template_id', onDelete: 'CASCADE' });
Field.belongsTo(Template, { foreignKey: 'template_id' });

User.hasMany(Category, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Export, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Export.belongsTo(User, { foreignKey: 'user_id' });

Template.hasMany(Export, { foreignKey: 'template_id', onDelete: 'CASCADE' });
Export.belongsTo(Template, { foreignKey: 'template_id' });

// Relations many-to-many
Template.belongsToMany(Category, { 
  through: TemplateCategory,
  foreignKey: 'template_id',
  otherKey: 'category_id',
  as: 'categories'
});

Category.belongsToMany(Template, { 
  through: TemplateCategory,
  foreignKey: 'category_id',
  otherKey: 'template_id',
  as: 'templates'
});

module.exports = {
  sequelize,
  User,
  Template,
  Slide,
  Field,
  Category,
  Export,
  TemplateCategory
};
