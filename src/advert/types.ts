export enum BudgetType {
  DAILY = "daily",
  LIFETIME = "lifetime",
}

///////////////TeMp
export interface Campaign {
  account_id: string;
  budget_rebalance_flag: boolean;
  budget_remaining: string;
  buying_type: string;
  campaign_group_active_time: string;
  can_create_brand_lift_study: boolean;
  can_use_spend_cap: boolean;
  configured_status: string;
  created_time: string;
  effective_status: string;
  has_secondary_skadnetwork_reporting: boolean;
  id: string;
  is_budget_schedule_enabled: boolean;
  is_skadnetwork_attribution: boolean;
  name: string;
  objective: string;
  primary_attribution: string;
  smart_promotion_type: string;
  source_campaign_id: string;
  special_ad_categories: string[];
  special_ad_category: string;
  start_time: string;
  status: string;
  topline_id: string;
  updated_time: string;
}

// ----------------------------------------------

export interface AdSet {
  account_id: string;
  bid_amount: number;
  bid_info: BidInfo;
  bid_strategy: string;
  billing_event: string;
  budget_remaining: string;
  campaign: Campaign;
  campaign_active_time: string;
  campaign_attribution: string;
  campaign_id: string;
  configured_status: string;
  created_time: string;
  daily_budget: string;
  destination_type: string;
  effective_status: string;
  end_time: string;
  id: string;
  is_budget_schedule_enabled: boolean;
  is_dynamic_creative: boolean;
  lifetime_budget: string;
  lifetime_imps: number;
  max_budget_spend_percentage: string;
  min_budget_spend_percentage: string;
  multi_optimization_goal_weight: string;
  name: string;
  optimization_goal: string;
  optimization_sub_event: string;
  pacing_type: string[];
  recurring_budget_semantics: boolean;
  source_adset_id: string;
  start_time: string;
  status: string;
  targeting: Targeting;
  targeting_optimization_types: TargetingOptimizationType[];
  updated_time: string;
  use_new_app_click: boolean;
}

export interface BidInfo {
  ACTIONS: number;
}

export interface Campaign {
  id: string;
}

export interface Targeting {
  age_max: number;
  age_min: number;
  geo_locations: GeoLocations;
}

export interface GeoLocations {
  countries: string[];
  location_types: string[];
}

export interface TargetingOptimizationType {
  key: string;
  value: number;
}

// ----------------------------------------------
export interface AdCreative {
  account_id: string;
  actor_id: string;
  body: string;
  call_to_action_type: string;
  effective_authorization_category: string;
  enable_direct_install: boolean;
  enable_launch_instant_app: boolean;
  id: string;
  link_og_id: string;
  link_url: string;
  name: string;
  object_id: string;
  object_story_spec: ObjectStorySpec;
  object_type: string;
  status: string;
  thumbnail_url: string;
  title: string;
  use_page_actor_override: boolean;
}

export interface ObjectStorySpec {
  page_id: string;
  link_data: LinkData;
}

export interface LinkData {
  link: string;
  message: string;
  image_hash: string;
  call_to_action: CallToAction;
}

export interface CallToAction {
  type: string;
  value: Value;
}

export interface Value {
  link: string;
}
