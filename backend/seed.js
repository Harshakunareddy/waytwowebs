const { sequelize, User, Project, ProjectMember, Task, TaskComment, ActivityLog } = require('./src/models');
const env = require('./src/config/environment');
const logger = require('./src/utils/logger');

const seed = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected for seeding');

    await sequelize.sync({ force: true });
    logger.info('Tables recreated');

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
    });

    const pm = await User.create({
      firstName: 'Project',
      lastName: 'Manager',
      email: 'pm@example.com',
      password: 'Pm@12345',
      role: 'project_manager',
    });

    const member1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Member@123',
      role: 'team_member',
    });

    const member2 = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: 'Member@123',
      role: 'team_member',
    });

    const project1 = await Project.create({
      name: 'E-Commerce Platform',
      description: 'Build a full-featured e-commerce platform with payment integration',
      startDate: '2026-10-01',
      deadline: '2026-12-31',
      status: 'active',
      createdBy: pm.id,
    });

    const project2 = await Project.create({
      name: 'Mobile App Redesign',
      description: 'Redesign the mobile application with modern UI/UX principles',
      startDate: '2026-10-15',
      deadline: '2027-01-15',
      status: 'planning',
      createdBy: pm.id,
    });

    await ProjectMember.bulkCreate([
      { projectId: project1.id, userId: pm.id },
      { projectId: project1.id, userId: member1.id },
      { projectId: project1.id, userId: member2.id },
      { projectId: project2.id, userId: pm.id },
      { projectId: project2.id, userId: member1.id },
    ]);

    const task1 = await Task.create({
      title: 'Setup project structure',
      description: 'Initialize the project repository and setup the basic folder structure',
      projectId: project1.id,
      assigneeId: member1.id,
      priority: 'high',
      status: 'done',
      dueDate: '2026-10-10',
      createdBy: pm.id,
    });

    const task2 = await Task.create({
      title: 'Design database schema',
      description: 'Create the database schema for users, products, and orders',
      projectId: project1.id,
      assigneeId: member1.id,
      priority: 'critical',
      status: 'in_progress',
      dueDate: '2026-10-20',
      createdBy: pm.id,
    });

    const task3 = await Task.create({
      title: 'Implement user authentication',
      description: 'Build login, registration, and password reset functionality',
      projectId: project1.id,
      assigneeId: member2.id,
      priority: 'high',
      status: 'to_do',
      dueDate: '2026-10-25',
      createdBy: pm.id,
    });

    const task4 = await Task.create({
      title: 'Create product listing page',
      description: 'Build the product catalog page with filtering and sorting',
      projectId: project1.id,
      assigneeId: member2.id,
      priority: 'medium',
      status: 'to_do',
      dueDate: '2026-11-05',
      createdBy: pm.id,
    });

    const task5 = await Task.create({
      title: 'Wireframe mobile screens',
      description: 'Create wireframes for all major mobile app screens',
      projectId: project2.id,
      assigneeId: member1.id,
      priority: 'high',
      status: 'in_review',
      dueDate: '2026-10-30',
      createdBy: pm.id,
    });

    await TaskComment.bulkCreate([
      { taskId: task1.id, userId: pm.id, content: 'Great work on the project structure!' },
      { taskId: task2.id, userId: member1.id, content: 'Working on the ER diagram now' },
      { taskId: task2.id, userId: pm.id, content: 'Make sure to add proper indexes' },
      { taskId: task5.id, userId: member1.id, content: 'Wireframes are ready for review' },
    ]);

    await ActivityLog.bulkCreate([
      { action: 'project_created', entityType: 'project', entityId: project1.id, userId: pm.id, details: { name: project1.name } },
      { action: 'project_created', entityType: 'project', entityId: project2.id, userId: pm.id, details: { name: project2.name } },
      { action: 'task_created', entityType: 'task', entityId: task1.id, userId: pm.id, details: { title: task1.title } },
      { action: 'task_status_changed', entityType: 'task', entityId: task1.id, userId: member1.id, details: { previousStatus: 'to_do', status: 'done' } },
      { action: 'member_added', entityType: 'project', entityId: project1.id, userId: pm.id, details: { addedUserId: member1.id } },
    ]);

    logger.info('Seed data created successfully');
    logger.info('---');
    logger.info('Admin: admin@example.com / Admin@123');
    logger.info('PM: pm@example.com / Pm@12345');
    logger.info('Member 1: john@example.com / Member@123');
    logger.info('Member 2: jane@example.com / Member@123');

    process.exit(0);
  } catch (err) {
    if (err.name === 'SequelizeConnectionRefusedError' || err.original?.code === 'ECONNREFUSED') {
      logger.error(`Database is not running! Please make sure your MySQL server is running at ${env.db.host}:${env.db.port} and check your .env configuration.`);
    } else if (err.name === 'SequelizeAccessDeniedError') {
      logger.error(`Database access denied for user '${env.db.user}'. Please check your DB credentials in .env.`);
    } else if (err.name === 'SequelizeDatabaseError' && err.original?.code === 'ER_BAD_DB_ERROR') {
      logger.error(`Database '${env.db.name}' does not exist. Please create the database first.`);
    } else if (err.name === 'SequelizeHostNotFoundError' || err.original?.code === 'ENOTFOUND') {
      logger.error(`Database host not found: '${env.db.host}'. Please check your DB_HOST setting in .env.`);
    } else if (err.name && err.name.startsWith('Sequelize')) {
      logger.error(`Database error: ${err.message || 'Unable to connect to database.'}`);
    } else {
      logger.error('Seeding failed:', err);
    }
    process.exit(1);
  }
};

seed();
