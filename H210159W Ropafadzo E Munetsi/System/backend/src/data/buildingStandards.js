export default {
  // DEFINITIONS AND TERMINOLOGY
  definitions: {
    habitable_room: "Any room designed for human occupation, but excluding bathrooms, water-closets, stairways, passageways, lift-cars, photographic dark rooms, sculleries, domestic laundries, cold rooms or garages used for parking only.",
    clear_height: "The vertical distance from floor to underside of ceiling, or, if there is no ceiling, to the underside of rafters, beams, tie-beams or joists.",
    floor_area: "The plan area of a room measured between internal finished wall surfaces.",
    window_identifier: "Windows are identified in plans and schedules using the format 'WO' followed by a number (e.g., WO1, WO2).",
    door_identifier: "Doors are identified in plans and schedules using the format 'DO' followed by a number (e.g., DO1, DO2).",
    lintel_level: "The height from floor level to the top of the lintel above doors and windows.",
    wall_plate_level: "The height from floor level to the top of the wall plate where the roof structure meets the wall.",
    max_roof_height: "The maximum vertical distance from floor level to the highest point of the roof structure."
  },

  // PLAN DOCUMENT STRUCTURE AND STANDARDS
  // This section organizes building standards according to typical plan document structure

  // 1. GENERAL PLAN REQUIREMENTS
  general_plan_requirements: {
    document_format: "All plans must be clear, legible, and properly labeled with project information.",
    required_plan_components: [
      "Project Information",
      "Site Plan",
      "Floor Plans",
      "Elevations (South, North, East, West)",
      "Section Drawings (A-A or A1-A1)",
      "Window, Door, and Ironmongery Schedules"
    ],
    scale_requirements: {
      site_plans: {
        if_site_area_exceeds_one_hectare: "Scale options: 1:2000, 1:1000, or 1:500",
        if_site_area_is_one_hectare_or_less: "Scale options: 1:500, 1:200, or 1:100"
      },
      floor_plans: "Floor plans shall be drawn to a scale of 1:100 or 1:50",
      elevations: "Elevations shall be drawn to a scale of 1:100 or 1:50",
      sections: "Section drawings shall be drawn to a scale of 1:50 or 1:20",
      detailed_drawings: "Detail drawings may be at scales of 1:50, 1:20, 1:10, 1:5, 1:2 or 1:1"
    },
    color_coding: {
      site_plans: {
        proposed_work: "Red",
        work_to_be_demolished: "Uncoloured with black dotted lines",
        new_private_sewers: "Brown"
      },
      working_drawings: {
        new_brick_and_masonry: "Red",
        new_concrete: "Green",
        new_iron_or_steel: "Blue",
        new_wood: "Yellow",
        work_to_be_demolished: "Uncoloured with black dotted lines"
      },
      sewerage_and_drainage_plans: {
        new_sewers_and_soil_pipes: "Brown",
        new_waste_pipes_and_private_sewers_carrying_trade_effluent: "Orange",
        new_waste_pipes_and_new_waste_sewers: "Green",
        new_vent_pipes: "Red",
        new_private_drains: "Blue"
      }
    }
  },

  // 2. PROJECT INFORMATION
  project_information: {
    required_details: {
      project_title: "Full title of the project as shown in the example plan (e.g., 'HOME SWEET HOME CO-OPERATIVE')",
      project_address: "Complete address of the project site including street name and number",
      owner_details: "Name, address, and contact information of the property owner",
      designer_details: "Name, registration number, and contact information of the architect/designer as shown in the example plan",
      engineer_details: "Name, registration number, and contact information of the structural engineer (if applicable)",
      drawing_index: "List of all drawings included in the submission with drawing numbers",
      drawing_date: "Date of drawing preparation and any revision dates",
      drawing_scale: "Scale of each drawing must be clearly indicated in the title block",
      north_point: "North point must be indicated on all plans"
    },
    title_block_requirements: {
      location: "Title block should be positioned in the bottom right corner of each drawing as shown in the example plan",
      content: [
        "Project title",
        "Client name",
        "Drawing title",
        "Drawing number",
        "Scale",
        "Date",
        "Designer information",
        "Revision information"
      ],
      format: "Title block should be clearly bordered and organized in a tabular format as shown in the example plan"
    },
    drawing_numbering_system: {
      format: "Drawing numbers should follow a consistent format (e.g., 'DWG NO: 001' as shown in the example plan)",
      sequence: "Drawings should be numbered sequentially according to drawing type"
    }
  },

  // 3. SITE PLAN
  site_plan: {
    general_requirements: "Site plan must clearly show the property boundaries, building location, and orientation as shown in the example plan.",
    scale_requirements: "Site plans should be drawn to a scale of 1:200 as shown in the example plan",
    required_elements: {
      identification: "Must show the registered site designation and location details",
      stand_number: "Stand number must be clearly indicated and correspond to the owner's details",
      location_and_boundaries: {
        street_name: "Name of the abutting street",
        sidewalk_widths: "Widths of any adjoining sidewalks",
        road_reservation: "Widths of any adjoining road reservations",
        access_roads: "Access roads to the property must be clearly shown"
      },
      dimensions: "Exact dimensions and boundaries of the site must be clearly indicated with measurements",
      natural_and_existing_features: "Include details of natural watercourses, ravines, boulders, slopes, and any existing sewers, drains, water mains, or underground utilities",
      surrounding_features: "Show surrounding features including adjacent stands and properties",
      drainage: {
        disposal_facility: "Show drainage disposal facilities",
        flow_direction: "Indicate the direction of drainage flow",
        gradient: "Drain gradient must be within 1:40"
      },
      building_layout: "Depict existing buildings, proposed buildings with distances between structures and site boundaries, and positions of water and sewer connections",
      vehicle_entrances: "Show location of proposed vehicle entry points",
      datum_levels: "Provide reduced levels at corners in relation to a specified datum",
      north_point: "Clearly indicate the direction of true north with a north arrow",
      building_footprint: "Show the building footprint with a distinctive shading or hatching as shown in the example plan",
      building_coverage: "Indicate the building coverage percentage on the stand, which must be within minimum and maximum requirements"
    },
    foundation_requirements: {
      excavation_depth: "The bottom of the foundation must be no less than 450 millimeters below the adjoining finished ground-level, unless otherwise authorized",
      foundation_types: [
        "Plain Concrete",
        "Reinforced Concrete",
        "Masonry (Stone, Brick or Block)",
        "Structural Steel"
      ],
      plain_concrete_foundations: {
        design_ratio: "The ratio of vertical thickness to the maximum projection beyond the supporting wall/column must be not less than 1.5 if the subsoil bearing pressure is ≤ 300 kPa. For pressures above 300 kPa, increase the ratio by a minimum of 0.1 for each 50 kPa (or fraction thereof) exceeding 300 kPa.",
        flexural_calculations: "When flexural calculations are made, the maximum tensile stress must not exceed 0.03 times the design 28-day compressive strength of the concrete."
      },
      reinforced_concrete_foundations: "Must be designed and constructed in accordance with the detailed requirements set out in the by-laws, referencing standards such as CAS 164, 165, 166, or 170 where applicable.",
      steel_foundations: {
        concrete_cover: "A minimum concrete cover of 75 millimeters must be provided over all structural steel elements.",
        grillage_foundation: "Steel beams used in a grillage foundation must rest on a minimum of 200 millimeters of Grade 20 concrete."
      },
      foundation_piers: {
        height_to_dimension_ratio: "The height of a plain concrete pier should not exceed twelve times its least lateral dimension.",
        compressive_stress_limitations: {
          if_height_less_than_or_equal_to_6_times_dimension: "Compressive stress should not exceed 0.2 times the design 28-day compressive strength of the concrete.",
          if_height_exceeds_6_times_and_not_exceeding_12_times: "Compressive stress must not exceed the value determined by the formula: (1.3 - [Height/(20 × Least Lateral Dimension)]) × p, where p is the permissible stress."
        },
        enlarged_base: {
          minimum_thickness: "The base of a pier enlarged beyond the shaft must have a vertical thickness of not less than 150 millimeters.",
          effective_height: "Effective height is measured from the top of the enlarged base to the underside of the supported member."
        }
      }
    },
    excavation_and_trenching: {
      minimum_distance_from_buildings: "No excavation or trench shall be made closer than the greater of 1.5 times the depth of the excavation or 1.25 meters from any building",
      excavation_depth_requirements: "Foundations must be excavated down to firm natural ground, except where a foundation is placed on solid rock",
      special_conditions: [
        "Heaving subsoils require a detailed report with remedial measures",
        "Collapsing subsoils (e.g., loose sands or soft silts) necessitate additional preventative design features",
        "Made-up ground requires a thorough ground investigation and approved precautionary measures"
      ]
    },
    load_and_stress_requirements: {
      overturning_resistance: "The moment resisting overturning must exceed the calculated overturning moment by at least 50% to ensure stability",
      combination_of_loads: "Building design must incorporate the combined effects of dead loads, superimposed loads, and other applied forces (as referenced to standard minimum load values, e.g., CAS 160).",
      material_specific_guidelines: {
        timber: "Design and construction must comply with CAS 162 for structural timber.",
        steel: "Design and construction must comply with CAS 157 for structural steel.",
        reinforced_concrete: "Design must adhere to the relevant CAS standards (CAS 164/165/166/170) for reinforced concrete."
      }
    },
    // documentation_and_approval: {
    //   plan_approval_process: {
    //     copies_retained: "One copy of approved plans is retained by the local authority and one copy must be kept on-site by the applicant.",
    //     signatures: "Plans must be dated and signed; structural detail drawings require the signature of the responsible structural engineer and the architect or designated professional on all other drawings.",
    //     accuracy_declaration: "All submissions must accurately reflect true dimensions and contain a declaration that no false information is presented."
    //   },
    //   submission_details: {
    //     application_format: "Plans must be submitted in duplicate along with a written application on the prescribed form, including supporting documentation such as cost estimates and material specifications.",
    //     timeframes: {
    //       initial_review: "Decisions on plan acceptance or rejection must be made within 35 days of receipt.",
    //       structural_drawings: "Structural detail drawings must also be reviewed within 35 days, with notice provided if amendments are required."
    //     },
    //     reconsideration_process: "If objections are raised or the plans are disapproved, detailed reasons must be provided and a window for amendments specified."
    //   }
    // }
  },
  // Residential Building Specific Requirements
  residential_building_requirements: {
    general_overview: "Residential building plans must demonstrate that all habitable spaces are designed with adequate dimensions, lighting, ventilation, and safe access. In addition to structural safety, these plans ensure the health, comfort, and safety of occupants.",
    room_dimension_and_layout: {
      minimum_room_sizes: {
        general_requirements: "In all habitable rooms, except kitchens, the minimum floor area over which the minimum clear height is maintained shall be 7 square meters, measured exclusive of immovable objects such as columns, stairways, and built-in cupboards.",
        minimum_horizontal_dimension: "All habitable rooms must have a minimum horizontal dimension of 2.1 meters.",
        bedrooms: {
          primary_bedroom: {
            minimum_area: 10.0, // square meters
            minimum_dimension: 2.5 // meters
          },
          secondary_bedroom: {
            minimum_area: 7.0, // square meters
            minimum_dimension: 2.1 // meters
          },
          single_bedroom: {
            minimum_area: 6.0, // square meters
            minimum_dimension: 2.1 // meters
          }
        },
        living_areas: {
          living_room: {
            minimum_area: 12.0, // square meters
            minimum_dimension: 3.0 // meters
          },
          dining_room: {
            minimum_area: 8.0, // square meters
            minimum_dimension: 2.4 // meters
          },
          combined_living_dining: {
            minimum_area: 16.0, // square meters
            minimum_dimension: 3.0 // meters
          }
        },
        kitchens_and_service_areas: {
          kitchen: {
            minimum_area: 5.0, // square meters
            minimum_dimension: 1.8, // meters
            minimum_counter_length: 2.0, // meters
            minimum_clearance: 1.2 // meters between counters
          },
          laundry: {
            minimum_area: 2.5, // square meters
            minimum_dimension: 1.5 // meters
          }
        },
        bathrooms: {
          toilet_only: {
            minimum_area: 1.2, // square meters
            minimum_dimension: 0.9 // meters
          },
          bathroom_with_shower: {
            minimum_area: 2.5, // square meters
            minimum_dimension: 1.5 // meters
          },
          bathroom_with_bathtub: {
            minimum_area: 3.5, // square meters
            minimum_dimension: 1.7 // meters
          },
          clearances: {
            toilet_front: 0.6, // meters
            toilet_sides: 0.2, // meters
            shower_entry: 0.6, // meters
            basin_front: 0.6 // meters
          }
        }
      },
      ceiling_heights: {
        description: "Minimum vertical clearance from floor to lintel level or underside of structure",
        habitable_rooms: {
          dwellings: 2.4, // meters
          shops: 2.9, // meters
          other_buildings: 2.6 // meters
        },
        non_habitable_rooms: 2.1, // meters
        minimum_clear_height_requirements: {
          description: "Every habitable room shall have a clear height as specified below over the required percentage of floor area.",
          percentage_requirements: {
            steeply_pitched_roof: 50, // 50% of floor area must meet minimum height for rooms with steeply pitched roofs
            standard_rooms: 75       // 75% of floor area must meet minimum height for standard rooms
          },
          access_areas: {
            description: "In portions of habitable rooms leading to or giving access to doors or windows, or at a horizontal distance from walls of 1.5 meters",
            minimum_height: 2.1      // Minimum clear height of 2.1m in these areas
          },
          measurement_method: "Clear height is measured from finished floor level to the underside of the ceiling or roof structure",
          exceptions: [
            "Beams may project below the minimum ceiling height provided they do not exceed 8% of the floor area",
            "Sloped ceilings must meet the minimum height requirement over the specified percentage of floor area"
          ]
        }
      },
      floor_plan_verification: {
        circulation_space: {
          description: "Corridor widths and circulation paths must allow safe movement and emergency evacuation",
          minimum_corridor_width: 1.0, // meters
          minimum_hallway_width: 0.9, // meters
          wheelchair_turning_space: 1.5 // meters diameter
        },
        door_and_window_clearances: {
          minimum_door_width: {
            main_entrance: 0.85, // meters
            interior_doors: 0.75, // meters
            bathroom_doors: 0.7, // meters
            wheelchair_accessible_doors: 0.85 // meters
          },
          door_swing_clearance: "Doors must have adequate swing clearance without obstructing circulation paths",
          window_operation_clearance: "Windows must have adequate clearance for operation"
        },
        room_relationships: {
          bedroom_privacy: "Bedrooms should be grouped in a private zone of the dwelling",
          living_areas: "Living areas should connect to dining and kitchen spaces for functional flow",
          bathroom_access: "Bathrooms should be accessible without passing through other habitable rooms",
          noise_separation: "Quiet zones (bedrooms) should be separated from noisy zones (living areas)"
        },
        entry_and_exit_points: {
          main_entrance: "Must be clearly defined and accessible from the street or driveway",
          secondary_exits: "At least one secondary exit must be provided for emergency evacuation",
          exit_path: "Clear path must be maintained from all habitable rooms to an exit"
        }
      },
      room_labeling: {
        requirement: "All rooms must be clearly labeled with their function on the floor plan",
        label_specifications: {
          text_size: "Minimum 3mm text height on printed plans",
          placement: "Labels must be placed within the room boundary",
          clarity: "Labels must be clearly legible and not obscured by other elements"
        },
        standard_labels: [
          "Bedroom",
          "Living Room",
          "Dining Room",
          "Kitchen",
          "Bathroom",
          "Toilet",
          "Laundry",
          "Garage",
          "Patio/Veranda"
        ]
      }
    },
    windows_and_natural_lighting: {
      egress_windows: {
        description: "Windows designed to allow emergency escape from habitable rooms",
        requirements: "Each habitable room must include at least one window meeting minimum egress dimensions",
        minimum_dimensions: {
          clear_opening_width: 0.5, // meters
          clear_opening_height: 0.6, // meters
          minimum_clear_opening_area: 0.5, // square meters
          maximum_sill_height: 1.1 // meters from floor level
        },
        basement_requirements: "Basement egress windows must have a window well with minimum dimensions of 0.9m x 0.9m and a minimum depth of 0.9m"
      },
      ventilation_requirements: {
        description: "Natural or mechanical ventilation must be provided in all habitable spaces to ensure proper air circulation.",
        natural_ventilation: {
          minimum_openable_area: "Openable window area must be at least 5% of the floor area of the room",
          cross_ventilation: "Where possible, windows should be positioned to allow cross-ventilation"
        },
        mechanical_ventilation: {
          minimum_air_changes: "At least 6 air changes per hour for habitable rooms",
          kitchen_extraction: "Kitchen extraction systems must provide at least 60 liters/second extraction rate",
          bathroom_extraction: "Bathroom extraction systems must provide at least 25 liters/second extraction rate"
        },
        air_bricks: "Air bricks must be provided for adequate ventilation in appropriate locations"
      },
      daylight_openings: {
        description: "Windows and other openings that provide natural light to habitable rooms",
        min_percentage_of_floor_area: 10, // Window glazing area must be at least 10% of floor area
        min_area_per_opening: 0.5, // square meters
        min_height_from_floor: 0.3, // meters
        max_height_from_floor: 1.9, // meters (for visibility)
        unobstructed_view: "Windows must provide an unobstructed view to the outside"
      },
      window_sill: {
        description: "The horizontal surface at the bottom of a window opening",
        min_height_above_pavement: 2.5, // meters (for windows facing public areas)
        min_height_above_floor: 0.6, // meters (for safety in residential buildings)
        max_height_above_floor: 0.9, // meters (for visibility in residential buildings)
        min_ventilation_area_per_soil_fitting: 0.2, // square meters
        waterproofing: "Window sills must be designed to prevent water infiltration",
        slope: "External window sills must have a minimum slope of 15 degrees to shed water"
      },
      window_door_schedules: {
        window_schedule: {
          description: "Window schedules must include window types, sizes, materials, and opening mechanisms.",
          required_elements: [
            "Window identifier (WO1, WO2, etc.)",
            "Window dimensions (width and height)",
            "Window type (fixed, casement, sliding, etc.)",
            "Material specifications",
            "Opening mechanism",
            "Glazing details"
          ]
        },
        door_schedule: {
          description: "Door schedules must include door types, sizes, materials, and fire ratings where applicable.",
          required_elements: [
            "Door identifier (DO1, DO2, etc.)",
            "Door dimensions (width and height)",
            "Door type (hinged, sliding, folding, etc.)",
            "Material specifications",
            "Fire rating (where applicable)",
            "Hardware specifications"
          ]
        }
      }
    },
    sanitary_and_plumbing_fixtures: {
      bathroom_and_toilet_requirements: "Each dwelling unit must include one or more bathrooms equipped with a water-closet, wash basin and a shower or bathtub where applicable.",
      kitchen_facilities: "Kitchen designs must allow for the efficient placement of sinks and storage while ensuring proper drainage.",
      fixture_layout: "Layouts should facilitate maintenance and regular inspection, complying with hygiene and safety standards."
    },
    fire_protection_and_evacuation: {
      fire_escape_routes: "Floor plans must include clearly marked, unobstructed escape routes. Fire escapes (internal/external staircases) must be provided for each level as per occupancy load.",
      emergency_exit_requirements: "Doors and passages designated for emergency egress must meet minimum size and hardware specifications.",
      fire_resistant_construction: {
        exit_way_fire_rating: 1,
        partition_basement_fire_rating: 0.5,
        floor_fire_rating: 0.5,
        roof_fire_rating: 0.5
      },
      smoke_detection_systems: "Smoke detectors and fire alarm systems are required in all dwelling units and common areas."
    },
    accessibility_and_circulation: {
      staircase_requirements: {
        min_width: 0.9,
        min_headroom: 2.3
      },
      access_egress: {
        min_exit_ways: 2,
        min_doorway_width: 1.1,
        min_passageway_width: 1.1,
        min_small_building_passageway: 0.8,
        max_dead_end_passageway: 15,
        min_passageway_non_street: 3
      },
      ramp_and_elevator_provisions: "Where applicable, ramps and elevators must be provided to ensure access for persons with disabilities.",
      accessibility_metrics: {
        wheelchair_turn_radius: 1.5,
        minimum_door_width: 0.8,
        maximum_ramp_slope: 0.083
      }
    },
    overall_building_height_and_setbacks: {
      height_requirements: {
        max_dwelling_storeys: 2,
        max_residential_storeys: 4,
        max_residential_height: 15
      },
      structural_heights: {
        description: "Plans must clearly indicate lintel level, wall plate level, and maximum roof height.",
        lintel_level: {
          typical_range: "1.8m to 2.4m above floor level",
          min_height: 1.8,
          max_height: 3.0
        },
        wall_plate_level: {
          typical_range: "2.4m to 3.6m above floor level",
          min_height: 2.4,
          max_height: 4.0
        },
        max_roof_height: {
          typical_range: "3.0m to 8.0m above floor level",
          min_height: 3.0,
          max_height: 10.0
        },
        requirements: [
          "Wall plate level must be higher than lintel level",
          "Maximum roof height must be higher than wall plate level",
          "All heights must be clearly indicated on section drawings"
        ]
      },
      setback_requirements: {
        description: "Minimum distances required between exterior walls/extensions and property boundaries",
        front_setback: 3.0, // meters from front property line
        side_setback: 1.5, // meters from side property lines
        rear_setback: 2.0, // meters from rear property line
        corner_lot_setback: 2.0, // meters from secondary street frontage
        setback_exceptions: [
          "Eaves may project up to 0.6m into the setback area",
          "Unroofed steps may project up to 1.0m into the setback area",
          "Boundary walls not exceeding 2.1m in height may be built on the property line"
        ]
      }
    },
    structural_and_miscellaneous: {
      structural: {
        minimum_beam_depth: 0.2,
        minimum_column_dimension: 0.25,
        maximum_floor_to_floor_height: 3.5
      },
      electrical: {
        minimum_outlets_per_room: 1,
        minimum_lighting_levels: {
          living_areas: 150,
          kitchens: 300,
          bathrooms: 200,
          hallways: 100
        }
      },
      plumbing: {
        minimum_fixture_requirements: {
          toilets_per_persons: 1,
          sinks_per_persons: 1,
          showers_per_persons: 1
        },
        minimum_pipe_sizes: {
          water_supply: 0.015,
          waste_pipe: 0.075
        }
      },
      energy_efficiency: {
        maximum_u_values: {
          walls: 0.35,
          roof: 0.25,
          floors: 0.25,
          windows: 2.0
        },
        minimum_insulation_thickness: 0.1
      }
    }
  },
  // 8. TECHNICAL STANDARDS AND MEASUREMENTS
  technical_standards: {
    // Room dimensions and layout
    room_dimensions: {
      clear_height: {
        habitable_rooms: {
          dwellings: 2.4,    // meters
          shops: 2.9,        // meters
          other_buildings: 2.6 // meters
        },
        non_habitable_rooms: 2.1, // meters
        access_areas_min: 2.1     // meters (for areas leading to doors/windows or within 1.5m of walls)
      },
      floor_area: {
        habitable_rooms_min: 7,      // square meters
        horizontal_dimension_min: 2.1, // meters
        alcove_max_percentage: 10,    // percent of total floor area
        minimum_height_coverage: {
          steeply_pitched_roof: 50,  // percent of floor area that must meet minimum height
          standard_rooms: 75         // percent of floor area that must meet minimum height
        }
      },
      measurement_exclusions: "Floor area measurements exclude immovable objects such as columns, stairways, and built-in cupboards."
    },

    // Natural lighting and ventilation
    natural_lighting_ventilation: {
      daylight_openings: {
        min_percentage: 5,    // percent of floor area
        min_area: 0.5,        // square meters
        min_height_from_floor: 0.3 // meters
      },
      ventilation: {
        min_percentage: 5,       // percent of floor area
        external_walls_required: true
      },
      windows: {
        min_height_above_pavement: 2.5,        // meters
        min_ventilation_per_soil_fitting: 0.2    // square meters
      }
    },

    // Structural elements
    structural_elements: {
      walls: {
        foundation_min_thickness: 0.215,   // meters (215mm)
        bearing_walls_min_thickness: 0.1,    // meters (100mm)
        bearing_walls_solid: 0.2,            // meters (200mm)
        bearing_walls_cavity: 0.15,          // meters (150mm)
        partition_walls_min: 0.1             // meters (100mm)
      },
      structural_members: {
        minimum_beam_depth: 0.2,       // meters
        minimum_column_dimension: 0.25, // meters
        maximum_floor_to_floor_height: 3.5 // meters
      },
      height_requirements: {
        max_dwelling_storeys: 2,
        max_residential_storeys: 4,
        max_residential_height: 15 // meters
      }
    },

    // Circulation and accessibility
    circulation_accessibility: {
      access_egress: {
        min_exit_ways: 2,           // per dwelling unit
        min_doorway_width: 1.1,     // meters
        min_passageway_width: 1.1,  // meters
        min_small_building_passageway: 0.8, // meters (800mm)
        max_dead_end_passageway: 15, // meters
        min_passageway_non_street: 3 // meters
      },
      stairways: {
        min_width: 0.9,    // meters (900mm)
        min_headroom: 2.3  // meters
      },
      accessibility: {
        wheelchair_turn_radius: 1.5, // meters
        minimum_door_width: 0.8,     // meters
        maximum_ramp_slope: 0.083    // 1:12 ratio
      }
    },

    // Safety and services
    safety_services: {
      fire_safety: {
        exit_way_fire_rating: 1,             // hour
        partition_basement_fire_rating: 0.5,   // hour (30 minutes)
        floor_fire_rating: 0.5,                // hour (30 minutes)
        roof_fire_rating: 0.5                  // hour (30 minutes)
      },
      electrical: {
        minimum_outlets_per_room: 1,
        minimum_lighting_levels: {
          living_areas: 150,  // lux
          kitchens: 300,
          bathrooms: 200,
          hallways: 100
        }
      },
      plumbing: {
        minimum_fixture_requirements: {
          toilets_per_persons: 1, // per 5 persons
          sinks_per_persons: 1,   // per 5 persons
          showers_per_persons: 1  // per 8 persons
        },
        minimum_pipe_sizes: {
          water_supply: 0.015, // meters (15mm)
          waste_pipe: 0.075    // meters (75mm)
        }
      },
      energy_efficiency: {
        maximum_u_values: {
          walls: 0.35,   // W/m²K
          roof: 0.25,
          floors: 0.25,
          windows: 2.0
        },
        minimum_insulation_thickness: 0.1  // meters
      }
    }
  },

  // 4. FLOOR PLANS
  floor_plans: {
    general_requirements: "Floor plans must show the layout of all rooms, spaces, and structural elements on each level of the building.",
    scale_requirements: "Floor plans should be drawn to a scale of 1:100 or 1:50 as shown in the example plan",
    required_elements: {
      room_layout: "Show all rooms, hallways, and spaces with their intended use clearly labeled",
      room_dimensions: "Provide internal dimensions of all rooms and spaces as well as overall building dimensions",
      wall_thicknesses: "Indicate the thickness of all walls with double lines for external and load-bearing walls",
      external_wall_thickness: "External wall thickness must be clearly indicated",
      door_and_window_positions: "Show the position and size of all doors and windows with reference numbers matching the door and window schedules",
      window_types: "Indicate window types with reference to the window schedule",
      air_bricks: "Indicate the position of air bricks for ventilation",
      structural_elements: "Show all structural elements including columns, beams, and load-bearing walls",
      fixtures_and_fittings: "Show the position of all fixed fixtures such as kitchen units, bathroom fixtures, and built-in furniture",
      sanitary_fixtures: "Provide sink, wash hand basin, water closet, bath/shower in correct positions",
      circulation: "Clearly indicate circulation paths, corridors, and staircases",
      passage_width: "Minimum width of passage must be clearly indicated",
      section_indicators: "Show clear section indicators (e.g., A-A) that reference the section drawings",
      plan_correspondence: "Floor plan must correspond with elevation and site plan"
    },
    room_dimension_and_layout: {
      minimum_room_sizes: {
        bedrooms: "Each bedroom should have a minimum usable area (e.g., not less than 9 m²) as per local standards.",
        living_areas: "Living/dining areas should have sufficient space (e.g., no less than 15-20 m²) to facilitate functional use.",
        kitchens_and_service_areas: "Must be designed to allow ample space for cooking, food preparation, and storage."
      },
      ceiling_heights: {
        habitable_rooms: 2.4,
        non_habitable_rooms: 2.1
      },
      floor_plan_verification: {
        circulation_space: "Corridor widths and circulation paths should allow safe movement and emergency evacuation.",
        door_and_window_clearances: "Entrances, doorways, and passageways must meet minimum width requirements."
      }
    }
  },

  // 5. ELEVATION DRAWINGS
  elevation_drawings: {
    general_requirements: "All elevation drawings must clearly show the external appearance of the building from all four cardinal directions (North, South, East, West) as shown in the example plan.",
    required_elevations: ["North Elevation", "South Elevation", "East Elevation", "West Elevation"],
    scale_requirements: "Elevations should be drawn to a scale of 1:100 as shown in the example plan",
    elements_to_include: {
      ground_level: "Natural and finished ground levels must be clearly indicated with a datum line",
      floor_levels: "All floor levels must be dimensioned relative to a fixed datum point",
      overall_height: "Total height of the building from ground level to the highest point must be clearly dimensioned",
      roof_details: "Roof pitch, overhangs, ridge heights, and materials must be clearly indicated",
      openings: "All doors and windows must be shown with dimensions and match the window/door schedule",
      external_features: "External features such as chimneys, balconies, and decorative elements must be shown"
    },
    dimension_requirements: {
      height_indicators: "Overall building height, floor-to-floor heights, and window/door heights must be clearly dimensioned",
      width_indicators: "Width of the building and major features must be clearly dimensioned"
    },
    consistency_requirements: "Ensure all elevations are consistent with the floor plan and with each other"
  },

  // 6. SECTION DRAWINGS
  section_drawings: {
    general_requirements: "Section drawings (A-A, A1-A1, etc.) must provide a vertical cut through the building showing internal heights and construction details as shown in the example plan.",
    scale_requirements: "Sections should be drawn to a scale of 1:100 for general sections and 1:20 for detailed sections as shown in the example plan",
    section_indicators: "Section lines must be clearly marked on the floor plan with arrows indicating the direction of view",
    section_placement: "Sections must be taken across a window opening to show lintel details",
    floor_plan_correspondence: "Section drawings must correspond with the floor plan",
    required_measurements: {
      room_heights: "Clear height of each room must be dimensioned, either directly as floor-to-ceiling height or indirectly through structural heights (lintel level, wall plate level, maximum roof height)",
      foundation_details: "Foundation depth and width must be clearly dimensioned",
      minimum_foundation_depth: "The bottom of the foundation must be no less than 450 millimeters below the adjoining finished ground-level",
      floor_thickness: "Thickness of floor slabs must be indicated",
      concrete_slab: "Concrete slab details including thickness and reinforcement must be shown",
      hard_core: "Hard core layer beneath concrete slabs must be shown with thickness",
      roof_pitch: "Roof pitch angle must be clearly indicated",
      roof_construction: "Roof structure, insulation, and covering details must be shown with dimensions",
      wall_plate_level: "Height of wall plate level from floor level must be dimensioned",
      lintel_level: "Height of lintels above floor level must be dimensioned",
      ceiling_level: "Height of ceiling from floor level must be dimensioned",
      structural_heights: "Structural heights (lintel level, wall plate level, maximum roof height) can be used to determine room heights and must be clearly dimensioned"
    },
    construction_details: {
      foundations: "Foundation type, materials, and reinforcement details must be shown",
      walls: "Wall construction, materials, and insulation details must be shown",
      floors: "Floor construction, materials, and insulation details must be shown",
      roof: "Roof construction, materials, and insulation details must be shown including trusses and supports",
      rainwater_disposal: "Rainwater disposal facilities such as gutters and downpipes must be shown"
    }
  },

  // 7. WINDOW, DOOR, AND IRONMONGERY SCHEDULES
  schedules: {
    general_requirements: "All schedules must be presented in a clear tabular format as shown in the example plan",
    window_schedule: {
      required_information: [
        "Window reference number/code that matches the floor plan and elevations",
        "Window type (casement, sliding, fixed, etc.)",
        "Window dimensions (width × height)",
        "Window material (aluminum, wood, uPVC, etc.)",
        "Glazing type (single, double, triple)",
        "Opening mechanism",
        "Quantity",
        "Location reference",
        "Elevation where the window appears"
      ],
      format: "Tabulated format with clear headings for each column as shown in the example plan"
    },
    door_schedule: {
      required_information: [
        "Door reference number/code that matches the floor plan and elevations",
        "Door type (single, double, sliding, etc.)",
        "Door dimensions (width × height)",
        "Door material (wood, metal, glass, etc.)",
        "Fire rating (if applicable)",
        "Quantity",
        "Location reference"
      ],
      format: "Tabulated format with clear headings for each column"
    },
    ironmongery_schedule: {
      required_information: [
        "Item reference number/code",
        "Item description (handle, lock, hinge, etc.)",
        "Material and finish",
        "Manufacturer/supplier",
        "Quantity",
        "Location/door reference"
      ],
      format: "Tabulated format with clear headings for each column"
    }
  },

  // 9. COMPLIANCE VALIDATION METHODS
  validation: {
    // Validation configuration
    config: {
      // Tolerance settings for different measurement types
      tolerances: {
        room_height: 0.05,       // 5cm tolerance for room heights
        room_dimension: 0.02,    // 2cm tolerance for room dimensions
        wall_thickness: 0.01,    // 1cm tolerance for wall thickness
        foundation_depth: 0.05,  // 5cm tolerance for foundation depths
        general: 0.01            // 1cm default tolerance
      },
      // Priority levels for validation checks
      priority_levels: {
        critical: {
          description: "Critical requirements that must be met for safety and compliance",
          weight: 3,
          examples: ["Minimum room heights", "Fire escape routes", "Structural integrity"]
        },
        standard: {
          description: "Standard requirements that should be met for proper building function",
          weight: 2,
          examples: ["Room dimensions", "Window sizes", "Door clearances"]
        },
        recommended: {
          description: "Recommended practices that improve building quality",
          weight: 1,
          examples: ["Color coding", "Drawing organization", "Detailed annotations"]
        }
      },
      // Validation exemptions
      exemptions: {
        // Exemptions can be granted for specific checks under certain conditions
        // For example, historical buildings might be exempt from certain modern standards
        historical_buildings: ["ceiling_height", "room_dimensions", "accessibility"],
        renovation_projects: ["foundation_requirements", "structural_changes"],
        temporary_structures: ["foundation_depth", "insulation_requirements"]
      }
    },
    // Helper methods for validation
    methods: {
      validateMeasurement(value, standard, measurementType = 'general') {
        // Use the appropriate tolerance based on measurement type
        const tolerance = this.config.tolerances[measurementType] || this.config.tolerances.general;
        return Math.abs(value - standard) <= tolerance;
      },
      validateMinimum(value, minimum, measurementType = 'general') {
        // Apply tolerance to minimum checks
        const tolerance = this.config.tolerances[measurementType] || this.config.tolerances.general;
        return value >= (minimum - tolerance);
      },
      validateMaximum(value, maximum, measurementType = 'general') {
        // Apply tolerance to maximum checks
        const tolerance = this.config.tolerances[measurementType] || this.config.tolerances.general;
        return value <= (maximum + tolerance);
      },
      validatePercentage(value, minPercentage, maxPercentage = 100) {
        return value >= minPercentage && value <= maxPercentage;
      },
      validateRoomHeight(height, roomType, context = {}) {
        // Only validate heights that are likely to be room heights
        // Ignore measurements that are clearly not ceiling heights
        if (height < 0.5) return { valid: true, reason: 'Measurement too small to be a room height' };
        if (height > 6) return { valid: true, reason: 'Measurement too large to be a room height' };

        // Check if the measurement is from a section drawing
        // If not from a section drawing, it's likely not a ceiling height
        if (!context.isFromSectionDrawing) {
          return { valid: true, reason: 'Measurement not from a section drawing' };
        }

        // If this is a structural height (lintel level, wall plate level, max roof height),
        // it's considered valid as an alternative to explicit room height
        if (context.isStructuralHeight) {
          return { valid: true, reason: 'Structural height measurements are provided as an alternative to explicit room heights' };
        }

        // Check for exemptions
        if (context.buildingType &&
            this.config.exemptions[context.buildingType] &&
            this.config.exemptions[context.buildingType].includes('ceiling_height')) {
          return { valid: true, reason: `Exemption granted for ${context.buildingType}` };
        }

        // Check if this is an access area (near doors/windows or within 1.5m of walls)
        if (context.isAccessArea) {
          const accessAreaMinHeight = this.technical_standards.room_dimensions.clear_height.access_areas_min;
          const isValid = this.validateMinimum(height, accessAreaMinHeight, 'room_height');

          return {
            valid: isValid,
            reason: isValid ? 'Meets minimum height requirement for access areas' :
              `Height of ${height}m is below minimum ${accessAreaMinHeight}m for access areas`,
            required: accessAreaMinHeight,
            provided: height,
            tolerance: this.config.tolerances.room_height,
            area_type: 'access_area'
          };
        }

        // Determine the appropriate minimum height based on room type and building type
        let minHeight;
        let buildingType = context.buildingType || 'dwellings'; // Default to dwellings if not specified

        if (roomType === 'habitable') {
          // For habitable rooms, check the specific building type
          if (buildingType === 'shops') {
            minHeight = this.technical_standards.room_dimensions.clear_height.habitable_rooms.shops;
          } else if (buildingType === 'other_buildings') {
            minHeight = this.technical_standards.room_dimensions.clear_height.habitable_rooms.other_buildings;
          } else {
            // Default to dwellings
            minHeight = this.technical_standards.room_dimensions.clear_height.habitable_rooms.dwellings;
          }
        } else {
          // For non-habitable rooms
          minHeight = this.technical_standards.room_dimensions.clear_height.non_habitable_rooms;
        }

        // Use room_height tolerance
        const isValid = this.validateMinimum(height, minHeight, 'room_height');

        // Determine the percentage of floor area that must meet this height
        const requiredPercentage = context.hasSteeplyPitchedRoof ?
          this.technical_standards.room_dimensions.floor_area.minimum_height_coverage.steeply_pitched_roof :
          this.technical_standards.room_dimensions.floor_area.minimum_height_coverage.standard_rooms;

        return {
          valid: isValid,
          reason: isValid ? `Meets minimum height requirement of ${minHeight}m for ${roomType} rooms in ${buildingType}` :
            `Height of ${height}m is below minimum ${minHeight}m for ${roomType} rooms in ${buildingType}`,
          required: minHeight,
          provided: height,
          tolerance: this.config.tolerances.room_height,
          required_coverage_percentage: requiredPercentage,
          building_type: buildingType
        };
      },
      validateScale(providedScale, requiredScale, context = {}) {
        // Handle different formats of scale representation (e.g., "1:100", "1/100")
        const normalizeScale = (scale) => {
          return scale.replace(':', '/').split('/').map(s => parseInt(s.trim()));
        };

        // Handle case where scale is not provided
        if (!providedScale) {
          return {
            valid: false,
            reason: 'Scale not provided',
            required: requiredScale,
            provided: 'missing'
          };
        }

        const [providedNum, providedDenom] = normalizeScale(providedScale);
        const [requiredNum, requiredDenom] = normalizeScale(requiredScale);

        // Check if scales are equivalent (e.g., 1:50 is equivalent to 2:100)
        const isEquivalent = (providedNum / providedDenom) === (requiredNum / requiredDenom);

        // For recommended priority level checks, equivalent scales are acceptable
        if (context.priorityLevel === 'recommended' && isEquivalent) {
          return {
            valid: true,
            reason: `Scale ${providedScale} is equivalent to required ${requiredScale}`,
            required: requiredScale,
            provided: providedScale
          };
        }

        const isExact = providedNum === requiredNum && providedDenom === requiredDenom;

        return {
          valid: isExact,
          reason: isExact ? `Scale matches required ${requiredScale}` :
            `Scale ${providedScale} does not match required ${requiredScale}`,
          required: requiredScale,
          provided: providedScale,
          isEquivalent: isEquivalent
        };
      },
      validateDrawingElements(drawing, requiredElements, context = {}) {
        if (!drawing) {
          return {
            valid: false,
            reason: 'Drawing not provided',
            missingElements: requiredElements,
            passedCount: 0,
            totalCount: requiredElements.length
          };
        }

        const missingElements = [];
        const presentElements = [];

        for (const element of requiredElements) {
          if (!drawing.hasElement(element)) {
            missingElements.push(element);
          } else {
            presentElements.push(element);
          }
        }

        // Determine priority level for this validation
        const priorityLevel = context.priorityLevel || 'standard';

        // For critical elements, any missing element is a failure
        // For standard elements, allow some missing elements
        // For recommended elements, be more lenient
        let threshold;
        switch(priorityLevel) {
          case 'critical':
            threshold = 1.0; // 100% required
            break;
          case 'standard':
            threshold = 0.8; // 80% required
            break;
          case 'recommended':
            threshold = 0.6; // 60% required
            break;
          default:
            threshold = 0.8;
        }

        const passedRatio = presentElements.length / requiredElements.length;
        const passed = passedRatio >= threshold;

        return {
          valid: passed,
          reason: passed ?
            `Drawing contains ${presentElements.length}/${requiredElements.length} required elements` :
            `Drawing missing ${missingElements.length}/${requiredElements.length} required elements`,
          missingElements: missingElements,
          presentElements: presentElements,
          passedCount: presentElements.length,
          totalCount: requiredElements.length,
          priorityLevel: priorityLevel,
          threshold: threshold
        };
      },
      validateDrawingSet(drawings, requiredDrawings, context = {}) {
        const missingDrawings = [];
        const presentDrawings = [];

        for (const drawing of requiredDrawings) {
          if (!drawings.includes(drawing)) {
            missingDrawings.push(drawing);
          } else {
            presentDrawings.push(drawing);
          }
        }

        // Critical drawings must all be present
        // Use context to determine which drawings are critical if provided
        const criticalDrawings = context.criticalDrawings || ['Floor Plan', 'Section Drawing'];
        const missingCritical = criticalDrawings.filter(drawing =>
          missingDrawings.includes(drawing)
        );

        // If this is a special building type with exemptions, check those
        if (context.buildingType &&
            this.config.exemptions[context.buildingType] &&
            this.config.exemptions[context.buildingType].includes('drawing_requirements')) {
          // Apply exemptions for special building types
          return {
            valid: true,
            reason: `Exemption granted for ${context.buildingType} - drawing requirements relaxed`,
            missingDrawings: missingDrawings,
            presentDrawings: presentDrawings,
            missingCritical: [],
            passedCount: presentDrawings.length,
            totalCount: requiredDrawings.length
          };
        }

        const passed = missingCritical.length === 0;

        return {
          valid: passed,
          reason: passed ?
            `All critical drawings present (${missingDrawings.length} non-critical drawings missing)` :
            `Missing critical drawings: ${missingCritical.join(', ')}`,
          missingDrawings: missingDrawings,
          presentDrawings: presentDrawings,
          missingCritical: missingCritical,
          passedCount: presentDrawings.length,
          totalCount: requiredDrawings.length
        };
      }
    },

    // Document extraction guidance
    document_extraction: {
      scales: "Extract scale information from title blocks or scale bars on each drawing",
      floor_plan: "Extract room dimensions, room counts, and layout information from floor plans",
      elevations: "Extract height information and external features from all four elevation drawings (North, South, East, West)",
      sections: "Extract vertical measurements including room heights, foundation depths, and roof details from section drawings",
      schedules: "Extract window and door specifications from the tabulated schedules",
      site_plan: "Extract site dimensions, setbacks, and orientation from the site plan"
    },

    // Improved extraction methods
    extraction_methods: {
      identifyRoomHeights(sectionDrawing) {
        // This method should only be called on section drawings
        if (!sectionDrawing || !sectionDrawing.type === 'section') {
          return { error: 'Not a section drawing' };
        }

        // In a real implementation, this would use computer vision or OCR
        // to identify room height dimensions from the section drawing
        // For now, we'll use a placeholder implementation

        // Look for dimension lines that:
        // 1. Are vertical
        // 2. Span from floor to ceiling
        // 3. Have a dimension text
        // 4. Are within rooms (not foundation or roof dimensions)

        // Example implementation (placeholder)
        const extractedHeights = sectionDrawing.getDimensionLines()
          .filter(line => line.isVertical())
          .filter(line => line.spansFloorToCeiling())
          .map(line => {
            // Determine if this is an access area (near doors/windows or within 1.5m of walls)
            const isAccessArea = line.isNearDoorOrWindow() || line.isWithinDistanceOfWall(1.5);

            // Determine if the room has a steeply pitched roof
            const hasSteeplyPitchedRoof = line.isInRoomWithSteeplyPitchedRoof();

            // Determine building type
            const buildingType = line.getBuildingType() || 'dwellings';

            return {
              value: line.getDimensionValue(),
              roomType: line.getRoomType() || 'unknown',
              isHabitable: line.isInHabitableRoom(),
              isAccessArea: isAccessArea,
              hasSteeplyPitchedRoof: hasSteeplyPitchedRoof,
              buildingType: buildingType,
              location: line.getLocation() || 'main room area'
            };
          });

        return extractedHeights;
      },

      identifyDrawingType(drawing) {
        // Identify if a drawing is a floor plan, elevation, section, etc.
        // based on its content and labels

        if (drawing.hasLabel(/floor\s*plan/i)) return 'floor_plan';
        if (drawing.hasLabel(/site\s*plan/i)) return 'site_plan';
        if (drawing.hasLabel(/section/i)) return 'section';
        if (drawing.hasLabel(/elevation/i)) {
          if (drawing.hasLabel(/north/i)) return 'north_elevation';
          if (drawing.hasLabel(/south/i)) return 'south_elevation';
          if (drawing.hasLabel(/east/i)) return 'east_elevation';
          if (drawing.hasLabel(/west/i)) return 'west_elevation';
          return 'elevation';
        }
        if (drawing.hasLabel(/schedule/i)) {
          if (drawing.hasLabel(/window/i)) return 'window_schedule';
          if (drawing.hasLabel(/door/i)) return 'door_schedule';
          return 'schedule';
        }

        return 'unknown';
      }
    },

    // Example plan compliance checks
    example_plan_compliance: {
      required_drawings: [
        "Floor Plan",
        "Site Plan",
        "Section Drawing",
        "North Elevation",
        "South Elevation",
        "East Elevation",
        "West Elevation",
        "Window and Door Schedule",
        "Architect's Details"
      ],
      drawing_scales: {
        floor_plan: "1:100",
        site_plan: "1:200",
        section: "1:100",
        elevations: "1:100"
      },
      required_elements: {
        floor_plan: ["Room labels", "Dimensions", "Wall thicknesses", "External wall thickness", "Door/window positions", "Window types", "Air bricks", "Section indicators", "Sanitary fixtures", "Passage width"],
        site_plan: ["Property boundaries", "Stand number", "Dimensions", "North arrow", "Building footprint", "Access roads", "Surrounding features", "Drainage", "Building coverage"],
        section: ["Foundation details", "Minimum foundation depth", "Room heights", "Roof structure", "Roof pitch", "Concrete slab", "Hard core", "Floor levels", "Lintel level", "Rainwater disposal"],
        elevations: ["Ground level", "Window/door positions", "Roof details", "Height dimensions"],
        schedules: ["Reference numbers", "Dimensions", "Types", "Descriptions"],
        architect_details: ["Name", "Registration number", "Contact information"]
      }
    },

    // Compliance tracking and reporting
    compliance: {
      // Compliance percentage calculation
      calculateCompliancePercentage(submittedPlan) {
        // Initialize counters
        let totalChecks = 0;
        let passedChecks = 0;

        // Create detailed compliance report
        const complianceReport = {
          drawings: { passed: 0, total: 0, missing: [] },
          scales: { passed: 0, total: 0, incorrect: [] },
          elements: { passed: 0, total: 0, missing: {} },
          dimensions: { passed: 0, total: 0, issues: [] },
          overall: { passed: 0, total: 0, percentage: 0 }
        };

        // First, identify all drawing types
        const drawings = submittedPlan.getAllDrawings();
        const identifiedDrawings = {};

        drawings.forEach(drawing => {
          const drawingType = this.extraction_methods.identifyDrawingType(drawing);
          identifiedDrawings[drawingType] = drawing;
        });

        // Check room heights only from section drawings
        if (identifiedDrawings.section) {
          const sectionDrawing = identifiedDrawings.section;
          const roomHeights = this.extraction_methods.identifyRoomHeights(sectionDrawing);

          // Validate room heights
          roomHeights.forEach(height => {
            totalChecks++;
            complianceReport.dimensions.total++;

            // Create context for validation with all the detailed information
            const context = {
              isFromSectionDrawing: true,
              buildingType: height.buildingType || submittedPlan.getBuildingType() || 'dwellings',
              priorityLevel: 'critical', // Room heights are critical for safety
              isAccessArea: height.isAccessArea || false,
              hasSteeplyPitchedRoof: height.hasSteeplyPitchedRoof || false,
              location: height.location || 'main room area'
            };

            const result = this.methods.validateRoomHeight(
              height.value,
              height.isHabitable ? 'habitable' : 'non_habitable',
              context
            );

            if (result.valid) {
              passedChecks++;
              complianceReport.dimensions.passed++;
            } else {
              complianceReport.dimensions.issues.push({
                type: 'room_height',
                value: height.value,
                required: result.required,
                roomType: height.roomType,
                reason: result.reason,
                tolerance: result.tolerance,
                building_type: context.buildingType,
                area_type: context.isAccessArea ? 'access_area' : 'main_area',
                required_coverage_percentage: result.required_coverage_percentage,
                location: context.location,
                hasSteeplyPitchedRoof: context.hasSteeplyPitchedRoof
              });
            }
          });
        }

        // Check for required drawings using the validateDrawingSet method
        const requiredDrawings = this.example_plan_compliance.required_drawings;
        const drawingsContext = {
          buildingType: submittedPlan.getBuildingType(),
          priorityLevel: 'critical' // Having required drawings is critical
        };

        const drawingsResult = this.methods.validateDrawingSet(
          submittedPlan.getDrawings(),
          requiredDrawings,
          drawingsContext
        );

        complianceReport.drawings.passed = drawingsResult.passedCount;
        complianceReport.drawings.total = drawingsResult.totalCount;
        complianceReport.drawings.missing = drawingsResult.missingDrawings;
        complianceReport.drawings.valid = drawingsResult.valid;
        complianceReport.drawings.reason = drawingsResult.reason;

        totalChecks += drawingsResult.totalCount;
        passedChecks += drawingsResult.passedCount;

        // Check drawing scales using the validateScale method
        const drawingScales = this.example_plan_compliance.drawing_scales;
        Object.keys(drawingScales).forEach(drawingType => {
          complianceReport.scales.total++;
          totalChecks++;

          const providedScale = submittedPlan.getScale(drawingType);
          const requiredScale = drawingScales[drawingType];
          const scaleContext = {
            drawingType: drawingType,
            priorityLevel: drawingType === 'floor_plan' || drawingType === 'section' ?
              'standard' : 'recommended' // Floor plan and section scales are more important
          };

          const scaleResult = this.methods.validateScale(providedScale, requiredScale, scaleContext);

          if (scaleResult.valid) {
            complianceReport.scales.passed++;
            passedChecks++;
          } else {
            complianceReport.scales.incorrect.push({
              drawingType,
              required: requiredScale,
              provided: providedScale || 'missing',
              reason: scaleResult.reason,
              isEquivalent: scaleResult.isEquivalent
            });
          }
        });

        // Check required elements for each drawing type using validateDrawingElements
        const requiredElements = this.example_plan_compliance.required_elements;
        Object.keys(requiredElements).forEach(drawingType => {
          const drawing = submittedPlan.getDrawing(drawingType);

          // Set priority level based on drawing type
          const elementsContext = {
            drawingType: drawingType,
            priorityLevel: drawingType === 'floor_plan' || drawingType === 'section' ?
              'critical' : 'standard' // Floor plan and section elements are critical
          };

          const elementsResult = this.methods.validateDrawingElements(
            drawing,
            requiredElements[drawingType],
            elementsContext
          );

          if (!complianceReport.elements.missing[drawingType]) {
            complianceReport.elements.missing[drawingType] = [];
          }

          complianceReport.elements.total += elementsResult.totalCount;
          complianceReport.elements.passed += elementsResult.passedCount;
          complianceReport.elements.missing[drawingType] = elementsResult.missingElements;

          totalChecks += elementsResult.totalCount;
          passedChecks += elementsResult.valid ? elementsResult.totalCount : elementsResult.passedCount;
        });

        // Calculate overall compliance
        complianceReport.overall.passed = passedChecks;
        complianceReport.overall.total = totalChecks;
        complianceReport.overall.percentage = (passedChecks / totalChecks) * 100;

        return {
          percentage: complianceReport.overall.percentage,
          report: complianceReport
        };
      },

      // Generate feedback based on compliance report
      generateComplianceFeedback(complianceReport) {
        const feedback = {
          summary: '',
          recommendations: [],
          criticalIssues: [],
          standardIssues: [],
          recommendedImprovements: [],
          detailedFeedback: {}
        };

        // Generate summary
        const percentage = complianceReport.overall.percentage.toFixed(2);
        if (percentage >= 90) {
          feedback.summary = `Your plan is ${percentage}% compliant with building standards. Excellent work!`;
        } else if (percentage >= 75) {
          feedback.summary = `Your plan is ${percentage}% compliant with building standards. A few improvements are needed.`;
        } else if (percentage >= 50) {
          feedback.summary = `Your plan is ${percentage}% compliant with building standards. Significant improvements are required.`;
        } else {
          feedback.summary = `Your plan is ${percentage}% compliant with building standards. Major revisions are necessary.`;
        }

        // Generate recommendations based on missing drawings
        if (complianceReport.drawings.missing.length > 0) {
          // Check if any critical drawings are missing
          const criticalDrawings = ['Floor Plan', 'Section Drawing'];
          const missingCritical = complianceReport.drawings.missing.filter(drawing =>
            criticalDrawings.includes(drawing)
          );

          if (missingCritical.length > 0) {
            feedback.criticalIssues.push(`CRITICAL: Add the following essential drawings: ${missingCritical.join(', ')}.`);
          }

          const missingNonCritical = complianceReport.drawings.missing.filter(drawing =>
            !criticalDrawings.includes(drawing)
          );

          if (missingNonCritical.length > 0) {
            feedback.standardIssues.push(`Add the following drawings: ${missingNonCritical.join(', ')}.`);
          }

          feedback.detailedFeedback.missingDrawings = complianceReport.drawings.missing;
          feedback.detailedFeedback.reason = complianceReport.drawings.reason;
        }

        // Generate recommendations based on incorrect scales
        if (complianceReport.scales.incorrect.length > 0) {
          // Separate critical/standard scale issues from recommended ones
          const criticalScales = complianceReport.scales.incorrect.filter(item =>
            item.drawingType === 'floor_plan' || item.drawingType === 'section'
          );

          const nonCriticalScales = complianceReport.scales.incorrect.filter(item =>
            item.drawingType !== 'floor_plan' && item.drawingType !== 'section'
          );

          criticalScales.forEach(item => {
            const message = item.isEquivalent ?
              `The scale for ${item.drawingType} (${item.provided}) is mathematically equivalent to the required scale (${item.required}), but should be standardized.` :
              `Correct the scale for ${item.drawingType} from ${item.provided} to ${item.required}.`;

            feedback.standardIssues.push(message);
          });

          nonCriticalScales.forEach(item => {
            const message = item.isEquivalent ?
              `The scale for ${item.drawingType} (${item.provided}) is mathematically equivalent to the recommended scale (${item.required}).` :
              `Consider using the recommended scale of ${item.required} for ${item.drawingType} instead of ${item.provided}.`;

            feedback.recommendedImprovements.push(message);
          });

          feedback.detailedFeedback.incorrectScales = complianceReport.scales.incorrect;
        }

        // Generate recommendations based on missing elements
        const missingElements = complianceReport.elements.missing;
        Object.keys(missingElements).forEach(drawingType => {
          if (missingElements[drawingType].length > 0) {
            // Determine if this is a critical drawing type
            const isCritical = drawingType === 'floor_plan' || drawingType === 'section';

            const message = `${isCritical ? 'IMPORTANT: ' : ''}Add the following elements to ${drawingType}: ${missingElements[drawingType].join(', ')}.`;

            if (isCritical) {
              feedback.criticalIssues.push(message);
            } else {
              feedback.standardIssues.push(message);
            }
          }
        });
        feedback.detailedFeedback.missingElements = missingElements;

        // Generate recommendations based on dimension issues
        if (complianceReport.dimensions && complianceReport.dimensions.issues) {
          const dimensionIssues = complianceReport.dimensions.issues;

          // Group issues by type
          const roomHeightIssues = dimensionIssues.filter(issue => issue.type === 'room_height');

          if (roomHeightIssues.length > 0) {
            // Room height issues are critical safety concerns
            feedback.criticalIssues.push('CRITICAL SAFETY ISSUE: Ensure all room heights meet minimum requirements as shown in the section drawings:');

            // Group by building type and room type
            const groupedIssues = {};

            roomHeightIssues.forEach(issue => {
              const key = `${issue.building_type || 'dwellings'}_${issue.roomType || 'habitable'}`;
              if (!groupedIssues[key]) {
                groupedIssues[key] = [];
              }
              groupedIssues[key].push(issue);
            });

            // Generate feedback for each group
            Object.keys(groupedIssues).forEach(key => {
              const issues = groupedIssues[key];
              const firstIssue = issues[0];
              const buildingType = firstIssue.building_type || 'dwellings';
              const roomType = firstIssue.roomType || 'habitable';

              // Add a header for this group
              feedback.criticalIssues.push(`- ${roomType.toUpperCase()} ROOMS IN ${buildingType.toUpperCase()}:`);

              // Add specific requirements
              feedback.criticalIssues.push(`  Required minimum height: ${firstIssue.required}m`);
              feedback.criticalIssues.push(`  Required coverage: At least ${firstIssue.required_coverage_percentage}% of floor area must meet this height`);

              // List all issues in this group
              issues.forEach(issue => {
                if (issue.area_type === 'access_area') {
                  feedback.criticalIssues.push(`  - Access area height of ${issue.value}m is below minimum ${issue.required}m (tolerance: ${issue.tolerance}m)`);
                } else {
                  feedback.criticalIssues.push(`  - Room height of ${issue.value}m is below minimum ${issue.required}m (tolerance: ${issue.tolerance}m)`);
                }
                feedback.criticalIssues.push(`    Reason: ${issue.reason}`);
              });

              // Add reference to building code
              feedback.criticalIssues.push(`  According to building code: Every habitable room shall have a clear height of ${firstIssue.required}m over at least ${firstIssue.required_coverage_percentage}% of the floor area.`);
            });

            // Add note about access areas
            feedback.criticalIssues.push('Note: In portions of habitable rooms leading to doors/windows or within 1.5m of walls, a minimum clear height of 2.1m is required.');
          }

          feedback.detailedFeedback.dimensionIssues = dimensionIssues;
        }

        // Combine all issues into recommendations, with critical issues first
        feedback.recommendations = [
          ...feedback.criticalIssues,
          ...feedback.standardIssues,
          ...feedback.recommendedImprovements
        ];

        // Add reference to example plan
        feedback.recommendations.push('Refer to the example compliant plan for guidance on proper formatting and content requirements.');

        return feedback;
      },

      // Initialize a new compliance tracker
      createComplianceTracker() {
        return {
          totalChecks: 0,
          passedChecks: 0,
          failedChecks: 0,
          checkResults: [],
          sectionResults: {}
        };
      },

      // Record a validation result
      recordValidationResult(tracker, section, checkName, passed, details = null) {
        tracker.totalChecks++;

        if (passed) {
          tracker.passedChecks++;
        } else {
          tracker.failedChecks++;
        }

        // Add to detailed results
        const result = {
          section,
          checkName,
          passed,
          details
        };

        tracker.checkResults.push(result);

        // Update section results
        if (!tracker.sectionResults[section]) {
          tracker.sectionResults[section] = {
            totalChecks: 0,
            passedChecks: 0,
            failedChecks: 0
          };
        }

        tracker.sectionResults[section].totalChecks++;
        if (passed) {
          tracker.sectionResults[section].passedChecks++;
        } else {
          tracker.sectionResults[section].failedChecks++;
        }

        return tracker;
      },

      // Calculate overall compliance percentage
      calculateOverallCompliance(tracker) {
        if (tracker.totalChecks === 0) return 0;
        return (tracker.passedChecks / tracker.totalChecks) * 100;
      },

      // Calculate section compliance percentage
      calculateSectionCompliance(tracker, section) {
        if (!tracker.sectionResults[section] || tracker.sectionResults[section].totalChecks === 0) {
          return 0;
        }

        return (tracker.sectionResults[section].passedChecks / tracker.sectionResults[section].totalChecks) * 100;
      },

      // Generate a compliance report
      generateComplianceReport(tracker) {
        const overallCompliance = this.calculateOverallCompliance(tracker);
        const sectionCompliance = {};

        // Calculate compliance for each section
        Object.keys(tracker.sectionResults).forEach(section => {
          sectionCompliance[section] = this.calculateSectionCompliance(tracker, section);
        });

        // Generate failed checks report
        const failedChecks = tracker.checkResults.filter(result => !result.passed);

        return {
          overallCompliance: parseFloat(overallCompliance.toFixed(2)),
          sectionCompliance,
          totalChecks: tracker.totalChecks,
          passedChecks: tracker.passedChecks,
          failedChecks: tracker.failedChecks,
          failedCheckDetails: failedChecks
        };
      }
    }
  }
};
