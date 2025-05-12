@startuml
' Styles and configuration
skinparam backgroundColor white
' Entities
entity Structure {
  *id : INTEGER <<PK, NOT NULL>>
  --
  *name : VARCHAR(255) <<NOT NULL>>
  *address : VARCHAR(255) <<NOT NULL>>
  *postal_code : TEXT <<NOT NULL>>
  *city : VARCHAR(255) <<NOT NULL>>
  *school_vacation_zone : ENUM [A, B, C] <<NOT NULL>>
  *active : BOOLEAN <<NOT NULL, DEFAULT true>>
}
entity User {
  *id : INTEGER <<PK, NOT NULL>>
  --
  *email : VARCHAR(255) <<NOT NULL, UNIQUE>>
  *password : VARCHAR(255) <<NOT NULL>>
  *last_name : VARCHAR(255) <<NOT NULL>>
  *first_name : VARCHAR(255) <<NOT NULL>>
  *phone : VARCHAR(50)
  *structure_id : INTEGER <<FK, NOT NULL>>
  *role : ENUM [admin, director, animator] <<NOT NULL>>
  *contract_type : ENUM [permanent, fixed_term, etc.] <<NOT NULL>>
  *weekly_hours : DECIMAL
  *annual_hours : DECIMAL
  *contract_start_date : TIMESTAMPTZ
  contract_end_date : TIMESTAMPTZ
  *active : BOOLEAN <<NOT NULL, DEFAULT true>>
}
entity Time_Tracking {
  *id : INTEGER <<PK, NOT NULL>>
  --
  *user_id : INTEGER <<FK, NOT NULL>>
  *date_time : TIMESTAMPTZ <<NOT NULL>>
  *tracking_type : ENUM [arrival, break_start, break_end, departure] <<NOT NULL>>
  comment : TEXT
  *validated : BOOLEAN <<NOT NULL>>
  validated_by : INTEGER <<FK, NOT NULL>>
}
entity Planned_Schedule {
  *id : INTEGER <<PK, NOT NULL>>
  --
  *user_id : INTEGER <<FK, NOT NULL>>
  *date : TIMESTAMPTZ
  *start_time : TIMESTAMPTZ
  *end_time : TIMESTAMPTZ
  break_start : TIMESTAMPTZ
  break_end : TIMESTAMPTZ
  comment : TEXT
  *is_template : BOOLEAN <<NOT NULL, DEFAULT true>>
}
entity Project {
  *id : INTEGER <<PK, NOT NULL>>
  --
  *structure_id : INTEGER <<FK, NOT NULL>>
  *name : VARCHAR(255)
  *description : TEXT
  *start_date : TIMESTAMPTZ
  *end_date : TIMESTAMPTZ
  *status : ENUM [in_preparation, in_progress, completed] <<NOT NULL>>
}
entity Task {
  *id : INTEGER <<PK, NOT NULL>>
  --
  *project_id : INTEGER <<FK, NOT NULL>>
  *name : VARCHAR(255) <<NOT NULL>>
  *description : TEXT
  *priority : ENUM [low, medium, high, urgent] <<NOT NULL>>
  *estimated_time : TIMESTAMPTZ
  *start_date : TIMESTAMPTZ
  *due_date : TIMESTAMPTZ
  *status : ENUM [to_do, in_progress, completed] <<NOT NULL>>
  recurrence : ENUM [daily, weekly, monthly] <<NOT NULL>>
}
entity User_Task {
  *id : INTEGER <<PK, NOT NULL>>
  --
  *user_id : INTEGER <<FK, NOT NULL>>
  *task_id : INTEGER <<FK, NOT NULL>>
  *time_worked : INTEGER 
  *work_date : TIMESTAMPTZ
}
entity Activity_Log {
  *id : INTEGER <<PK, NOT NULL>>
  --
  *user_id : INTEGER <<FK, NOT NULL>>
  *action_date : TIMESTAMPTZ
  *action_type : ENUM [login, creation, modification, deletion] <<NOT NULL>>
  *description : TEXT
  *ip_address : VARCHAR(25)
}
entity School_Vacations {
  *id : INTEGER <<PK, NOT NULL>>
  --
  *zone : ENUM [A, B, C] <<NOT NULL>>
  *period_name : VARCHAR(255) <<NOT NULL>>
  *start_date : TIMESTAMPTZ
  *end_date : TIMESTAMPTZ
  *school_year : VARCHAR(255) <<NOT NULL>>
}
' Relationships
Structure "1" -- "1..*" User : BELONGS_TO >
Structure "1" -- "1..*" Project : DEPENDS_ON >
User "1" -- "1..*" Time_Tracking : PERFORMS >
User "1" -- "1..*" Planned_Schedule : ESTABLISHES >
Project "1" -- "1..*" Task : CONTAINS >
User "1" -- "1..*" User_Task : IS ASSIGNED TO >
Task "1" -- "1..*" User_Task : IS ASSIGNED TO >
User "1" -- "1..*" Activity_Log : GENERATES >
User "1" -- "0..*" Time_Tracking : VALIDATES >
@enduml