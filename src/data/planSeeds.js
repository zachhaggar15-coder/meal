const CORE_PLAN_SEEDS = [
  // ── WEIGHT LOSS (30) ─────────────────────────────────────────────────────
  { slug: 'aldi-weight-loss-1500', goal: 'weight-loss', supermarket: 'aldi', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Aldi Weight Loss Meal Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-weight-loss-1800', goal: 'weight-loss', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Aldi Weight Loss Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-weight-loss-1500-v2', goal: 'weight-loss', supermarket: 'aldi', calories: 1500, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 1, title: 'Aldi Vegetarian Weight Loss Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-weight-loss-1800-vegan', goal: 'weight-loss', supermarket: 'aldi', calories: 1800, dietType: 'vegan', budget: 'very-cheap', effort: 'batch', mealSetIndex: 2, title: 'Aldi Vegan Weight Loss Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'tesco-weight-loss-1500', goal: 'weight-loss', supermarket: 'tesco', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Tesco Weight Loss Meal Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-weight-loss-1800', goal: 'weight-loss', supermarket: 'tesco', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Tesco Weight Loss Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-weight-loss-1800-veg', goal: 'weight-loss', supermarket: 'tesco', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Tesco Vegetarian Weight Loss Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'asda-weight-loss-1500', goal: 'weight-loss', supermarket: 'asda', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 0, title: 'Asda Weight Loss Meal Plan — 1,500 kcal', emphasis: 'low-cal-swaps' },
  { slug: 'asda-weight-loss-1800', goal: 'weight-loss', supermarket: 'asda', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Asda Weight Loss Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-weight-loss-1500-vegan', goal: 'weight-loss', supermarket: 'asda', calories: 1500, dietType: 'vegan', budget: 'budget', effort: 'standard', mealSetIndex: 3, title: 'Asda Vegan Weight Loss Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'sainsburys-weight-loss-1500', goal: 'weight-loss', supermarket: 'sainsburys', calories: 1500, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 0, title: "Sainsbury's Weight Loss Meal Plan — 1,500 kcal", emphasis: 'lean-protein' },
  { slug: 'sainsburys-weight-loss-1800', goal: 'weight-loss', supermarket: 'sainsburys', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 2, title: "Sainsbury's Weight Loss Meal Plan — 1,800 kcal", emphasis: 'lean-protein' },
  { slug: 'sainsburys-weight-loss-veg-1500', goal: 'weight-loss', supermarket: 'sainsburys', calories: 1500, dietType: 'vegetarian', budget: 'moderate', effort: 'standard', mealSetIndex: 4, title: "Sainsbury's Vegetarian Weight Loss Plan — 1,500 kcal", emphasis: 'whole-food' },
  { slug: 'lidl-weight-loss-1500', goal: 'weight-loss', supermarket: 'lidl', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 1, title: 'Lidl Weight Loss Meal Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'lidl-weight-loss-1800', goal: 'weight-loss', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'batch', mealSetIndex: 2, title: 'Lidl Weight Loss Meal Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'lidl-weight-loss-veg-1800', goal: 'weight-loss', supermarket: 'lidl', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 3, title: 'Lidl Vegetarian Weight Loss Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'morrisons-weight-loss-1500', goal: 'weight-loss', supermarket: 'morrisons', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Morrisons Weight Loss Meal Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'morrisons-weight-loss-1800', goal: 'weight-loss', supermarket: 'morrisons', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Morrisons Weight Loss Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'morrisons-weight-loss-vegan-1500', goal: 'weight-loss', supermarket: 'morrisons', calories: 1500, dietType: 'vegan', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Morrisons Vegan Weight Loss Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-weight-loss-1800-v3', goal: 'weight-loss', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 3, title: 'Aldi Quick Weight Loss Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'tesco-weight-loss-1500-v2', goal: 'weight-loss', supermarket: 'tesco', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 4, title: 'Tesco Batch Cook Weight Loss Plan — 1,500 kcal', emphasis: 'batch-cooking' },
  { slug: 'asda-weight-loss-1800-v2', goal: 'weight-loss', supermarket: 'asda', calories: 1800, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Asda Pescatarian Weight Loss Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-weight-loss-1800-v2', goal: 'weight-loss', supermarket: 'sainsburys', calories: 1800, dietType: 'vegan', budget: 'moderate', effort: 'batch', mealSetIndex: 1, title: "Sainsbury's Vegan Weight Loss Plan — 1,800 kcal", emphasis: 'batch-cooking' },
  { slug: 'lidl-weight-loss-1500-v2', goal: 'weight-loss', supermarket: 'lidl', calories: 1500, dietType: 'vegan', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Lidl Vegan Weight Loss Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'iceland-weight-loss-1800', goal: 'weight-loss', supermarket: 'iceland', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 0, title: 'Iceland Weight Loss Meal Plan — 1,800 kcal', emphasis: 'frozen-friendly' },
  { slug: 'iceland-weight-loss-1500', goal: 'weight-loss', supermarket: 'iceland', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 2, title: 'Iceland Budget Weight Loss Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'morrisons-weight-loss-1800-v2', goal: 'weight-loss', supermarket: 'morrisons', calories: 1800, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 3, title: 'Morrisons Pescatarian Weight Loss Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'any-weight-loss-1500', goal: 'weight-loss', supermarket: 'any', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Weight Loss Meal Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'any-weight-loss-1800', goal: 'weight-loss', supermarket: 'any', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Weight Loss Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'any-weight-loss-1800-veg', goal: 'weight-loss', supermarket: 'any', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Vegetarian Weight Loss Meal Plan — 1,800 kcal', emphasis: 'whole-food' },

  // ── HIGH PROTEIN LOW CALORIE (25) ─────────────────────────────────────────
  { slug: 'aldi-high-protein-low-cal-1500', goal: 'high-protein-low-cal', supermarket: 'aldi', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Aldi High Protein Low Calorie Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-high-protein-low-cal-1800', goal: 'high-protein-low-cal', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 1, title: 'Aldi High Protein Low Calorie Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-high-protein-low-cal-1500', goal: 'high-protein-low-cal', supermarket: 'tesco', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Tesco High Protein Low Calorie Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-high-protein-low-cal-1800', goal: 'high-protein-low-cal', supermarket: 'tesco', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 2, title: 'Tesco High Protein Low Calorie Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'asda-high-protein-low-cal-1800', goal: 'high-protein-low-cal', supermarket: 'asda', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Asda High Protein Low Calorie Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-high-protein-low-cal-1500', goal: 'high-protein-low-cal', supermarket: 'asda', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 3, title: 'Asda High Protein Low Calorie Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-high-protein-low-cal-1800', goal: 'high-protein-low-cal', supermarket: 'sainsburys', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 2, title: "Sainsbury's High Protein Low Calorie Plan — 1,800 kcal", emphasis: 'lean-protein' },
  { slug: 'lidl-high-protein-low-cal-1500', goal: 'high-protein-low-cal', supermarket: 'lidl', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Lidl High Protein Low Calorie Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'morrisons-high-protein-low-cal-1800', goal: 'high-protein-low-cal', supermarket: 'morrisons', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Morrisons High Protein Low Calorie Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'iceland-high-protein-low-cal-1800', goal: 'high-protein-low-cal', supermarket: 'iceland', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 2, title: 'Iceland High Protein Low Calorie Plan — 1,800 kcal', emphasis: 'frozen-friendly' },
  { slug: 'aldi-high-protein-low-cal-veg-1800', goal: 'high-protein-low-cal', supermarket: 'aldi', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 3, title: 'Aldi Vegetarian High Protein Low Calorie Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-high-protein-low-cal-veg-1500', goal: 'high-protein-low-cal', supermarket: 'tesco', calories: 1500, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Tesco Vegetarian High Protein Low Calorie Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'asda-high-protein-low-cal-pesc-1800', goal: 'high-protein-low-cal', supermarket: 'asda', calories: 1800, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Asda Pescatarian High Protein Low Calorie Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'lidl-high-protein-low-cal-1800', goal: 'high-protein-low-cal', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'batch', mealSetIndex: 1, title: 'Lidl High Protein Low Calorie Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'any-high-protein-low-cal-1500', goal: 'high-protein-low-cal', supermarket: 'any', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'High Protein Low Calorie Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'any-high-protein-low-cal-1800', goal: 'high-protein-low-cal', supermarket: 'any', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 3, title: 'High Protein Low Calorie Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'morrisons-high-protein-low-cal-1500', goal: 'high-protein-low-cal', supermarket: 'morrisons', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Morrisons High Protein Low Calorie Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-high-protein-low-cal-1500', goal: 'high-protein-low-cal', supermarket: 'sainsburys', calories: 1500, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 0, title: "Sainsbury's High Protein Low Calorie Plan — 1,500 kcal", emphasis: 'lean-protein' },
  { slug: 'aldi-high-protein-low-cal-1500-v2', goal: 'high-protein-low-cal', supermarket: 'aldi', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'batch', mealSetIndex: 2, title: 'Aldi High Protein Batch Cook Plan — 1,500 kcal', emphasis: 'batch-cooking' },
  { slug: 'tesco-high-protein-low-cal-pesc-1800', goal: 'high-protein-low-cal', supermarket: 'tesco', calories: 1800, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Tesco Pescatarian High Protein Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'any-high-protein-low-cal-veg-1800', goal: 'high-protein-low-cal', supermarket: 'any', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Vegetarian High Protein Low Calorie Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'asda-high-protein-low-cal-1800-v2', goal: 'high-protein-low-cal', supermarket: 'asda', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'high-variety', mealSetIndex: 3, title: 'Asda High Protein Variety Plan — 1,800 kcal', emphasis: 'high-variety' },
  { slug: 'lidl-high-protein-low-cal-veg-1800', goal: 'high-protein-low-cal', supermarket: 'lidl', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Lidl Vegetarian High Protein Low Calorie Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'iceland-high-protein-low-cal-1500', goal: 'high-protein-low-cal', supermarket: 'iceland', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 4, title: 'Iceland High Protein Low Calorie Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'morrisons-high-protein-low-cal-pesc-1800', goal: 'high-protein-low-cal', supermarket: 'morrisons', calories: 1800, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Morrisons Pescatarian High Protein Plan — 1,800 kcal', emphasis: 'lean-protein' },

  // ── MUSCLE GAIN (20) ─────────────────────────────────────────────────────
  { slug: 'aldi-muscle-gain-2000', goal: 'muscle-gain', supermarket: 'aldi', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Aldi Muscle Gain Meal Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-muscle-gain-2500', goal: 'muscle-gain', supermarket: 'aldi', calories: 2500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Aldi Muscle Gain Meal Plan — 2,500 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-muscle-gain-2000', goal: 'muscle-gain', supermarket: 'tesco', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 0, title: 'Tesco Muscle Gain Meal Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'tesco-muscle-gain-2500', goal: 'muscle-gain', supermarket: 'tesco', calories: 2500, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 2, title: 'Tesco Muscle Gain Meal Plan — 2,500 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-muscle-gain-2000', goal: 'muscle-gain', supermarket: 'asda', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Asda Muscle Gain Meal Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-muscle-gain-2500', goal: 'muscle-gain', supermarket: 'asda', calories: 2500, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 3, title: 'Asda Muscle Gain Batch Plan — 2,500 kcal', emphasis: 'batch-cooking' },
  { slug: 'sainsburys-muscle-gain-2000', goal: 'muscle-gain', supermarket: 'sainsburys', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 2, title: "Sainsbury's Muscle Gain Plan — 2,000 kcal", emphasis: 'lean-protein' },
  { slug: 'lidl-muscle-gain-2000', goal: 'muscle-gain', supermarket: 'lidl', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Lidl Muscle Gain Meal Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'lidl-muscle-gain-2500', goal: 'muscle-gain', supermarket: 'lidl', calories: 2500, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 4, title: 'Lidl Muscle Gain Batch Plan — 2,500 kcal', emphasis: 'batch-cooking' },
  { slug: 'morrisons-muscle-gain-2000', goal: 'muscle-gain', supermarket: 'morrisons', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 1, title: 'Morrisons Muscle Gain Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-muscle-gain-2000-v2', goal: 'muscle-gain', supermarket: 'aldi', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'high-variety', mealSetIndex: 3, title: 'Aldi High Variety Muscle Gain Plan — 2,000 kcal', emphasis: 'high-variety' },
  { slug: 'tesco-muscle-gain-2000-veg', goal: 'muscle-gain', supermarket: 'tesco', calories: 2000, dietType: 'vegetarian', budget: 'moderate', effort: 'standard', mealSetIndex: 4, title: 'Tesco Vegetarian Muscle Gain Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'asda-muscle-gain-2500-v2', goal: 'muscle-gain', supermarket: 'asda', calories: 2500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Asda Muscle Gain Plan — 2,500 kcal', emphasis: 'lean-protein' },
  { slug: 'lidl-muscle-gain-2000-v2', goal: 'muscle-gain', supermarket: 'lidl', calories: 2000, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Lidl Pescatarian Muscle Gain Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'any-muscle-gain-2000', goal: 'muscle-gain', supermarket: 'any', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Muscle Gain Meal Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'any-muscle-gain-2500', goal: 'muscle-gain', supermarket: 'any', calories: 2500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 3, title: 'Muscle Gain Meal Plan — 2,500 kcal', emphasis: 'lean-protein' },
  { slug: 'morrisons-muscle-gain-2500', goal: 'muscle-gain', supermarket: 'morrisons', calories: 2500, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 0, title: 'Morrisons Muscle Gain Plan — 2,500 kcal', emphasis: 'batch-cooking' },
  { slug: 'sainsburys-muscle-gain-2500', goal: 'muscle-gain', supermarket: 'sainsburys', calories: 2500, dietType: 'standard', budget: 'flexible', effort: 'standard', mealSetIndex: 4, title: "Sainsbury's Muscle Gain Plan — 2,500 kcal", emphasis: 'lean-protein' },
  { slug: 'iceland-muscle-gain-2000', goal: 'muscle-gain', supermarket: 'iceland', calories: 2000, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 2, title: 'Iceland Muscle Gain Meal Plan — 2,000 kcal', emphasis: 'frozen-friendly' },
  { slug: 'aldi-muscle-gain-2500-veg', goal: 'muscle-gain', supermarket: 'aldi', calories: 2500, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Aldi Vegetarian Muscle Gain Plan — 2,500 kcal', emphasis: 'whole-food' },

  // ── BUDGET FAT LOSS (25) ──────────────────────────────────────────────────
  { slug: 'aldi-budget-fat-loss-1500', goal: 'budget-fat-loss', supermarket: 'aldi', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Aldi Budget Fat Loss Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-budget-fat-loss-1800', goal: 'budget-fat-loss', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 1, title: 'Aldi Budget Fat Loss Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'lidl-budget-fat-loss-1500', goal: 'budget-fat-loss', supermarket: 'lidl', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Lidl Budget Fat Loss Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'lidl-budget-fat-loss-1800', goal: 'budget-fat-loss', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'batch', mealSetIndex: 2, title: 'Lidl Budget Fat Loss Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'iceland-budget-fat-loss-1500', goal: 'budget-fat-loss', supermarket: 'iceland', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 0, title: 'Iceland Budget Fat Loss Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'iceland-budget-fat-loss-1800', goal: 'budget-fat-loss', supermarket: 'iceland', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 1, title: 'Iceland Budget Fat Loss Plan — 1,800 kcal', emphasis: 'frozen-friendly' },
  { slug: 'asda-budget-fat-loss-1500', goal: 'budget-fat-loss', supermarket: 'asda', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Asda Budget Fat Loss Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-budget-fat-loss-1800', goal: 'budget-fat-loss', supermarket: 'asda', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Asda Budget Fat Loss Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-budget-fat-loss-1500', goal: 'budget-fat-loss', supermarket: 'tesco', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Tesco Budget Fat Loss Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-budget-fat-loss-1800', goal: 'budget-fat-loss', supermarket: 'tesco', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 3, title: 'Tesco Budget Fat Loss Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'morrisons-budget-fat-loss-1500', goal: 'budget-fat-loss', supermarket: 'morrisons', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Morrisons Budget Fat Loss Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-budget-fat-loss-veg-1800', goal: 'budget-fat-loss', supermarket: 'aldi', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 3, title: 'Aldi Vegetarian Budget Fat Loss Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'lidl-budget-fat-loss-veg-1500', goal: 'budget-fat-loss', supermarket: 'lidl', calories: 1500, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 4, title: 'Lidl Vegetarian Budget Fat Loss Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-budget-fat-loss-1500-v2', goal: 'budget-fat-loss', supermarket: 'aldi', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 2, title: 'Aldi Easy Budget Fat Loss Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'lidl-budget-fat-loss-1500-v2', goal: 'budget-fat-loss', supermarket: 'lidl', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 1, title: 'Lidl Easy Budget Fat Loss Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'any-budget-fat-loss-1500', goal: 'budget-fat-loss', supermarket: 'any', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Budget Fat Loss Meal Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'any-budget-fat-loss-1800', goal: 'budget-fat-loss', supermarket: 'any', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Budget Fat Loss Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'iceland-budget-fat-loss-vegan-1800', goal: 'budget-fat-loss', supermarket: 'iceland', calories: 1800, dietType: 'vegan', budget: 'very-cheap', effort: 'low', mealSetIndex: 3, title: 'Iceland Vegan Budget Fat Loss Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'asda-budget-fat-loss-vegan-1500', goal: 'budget-fat-loss', supermarket: 'asda', calories: 1500, dietType: 'vegan', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Asda Vegan Budget Fat Loss Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-budget-fat-loss-batch-1800', goal: 'budget-fat-loss', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'batch', mealSetIndex: 4, title: 'Aldi Budget Fat Loss Batch Cook Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'lidl-budget-fat-loss-1800-v2', goal: 'budget-fat-loss', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Lidl Budget Fat Loss Plan — 1,800 kcal v2', emphasis: 'lean-protein' },
  { slug: 'tesco-budget-fat-loss-1800-v2', goal: 'budget-fat-loss', supermarket: 'tesco', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Tesco Budget Fat Loss Plan — 1,800 kcal v2', emphasis: 'lean-protein' },
  { slug: 'morrisons-budget-fat-loss-1800', goal: 'budget-fat-loss', supermarket: 'morrisons', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 3, title: 'Morrisons Budget Fat Loss Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-budget-fat-loss-1500', goal: 'budget-fat-loss', supermarket: 'sainsburys', calories: 1500, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 2, title: "Sainsbury's Budget Fat Loss Plan — 1,500 kcal", emphasis: 'lean-protein' },
  { slug: 'aldi-budget-fat-loss-pesc-1800', goal: 'budget-fat-loss', supermarket: 'aldi', calories: 1800, dietType: 'pescatarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 1, title: 'Aldi Pescatarian Budget Fat Loss Plan — 1,800 kcal', emphasis: 'lean-protein' },

  // ── CHEAP STUDENT (25) ────────────────────────────────────────────────────
  { slug: 'aldi-cheap-student-1800', goal: 'cheap-student', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 0, title: 'Aldi Cheap Student Meal Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'lidl-cheap-student-1800', goal: 'cheap-student', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 1, title: 'Lidl Cheap Student Meal Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'asda-cheap-student-1800', goal: 'cheap-student', supermarket: 'asda', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 0, title: 'Asda Cheap Student Meal Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'tesco-cheap-student-1800', goal: 'cheap-student', supermarket: 'tesco', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 2, title: 'Tesco Cheap Student Meal Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'iceland-cheap-student-1800', goal: 'cheap-student', supermarket: 'iceland', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 1, title: 'Iceland Cheap Student Meal Plan — 1,800 kcal', emphasis: 'frozen-friendly' },
  { slug: 'aldi-cheap-student-1500', goal: 'cheap-student', supermarket: 'aldi', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 3, title: 'Aldi Cheap Student Meal Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'lidl-cheap-student-2000', goal: 'cheap-student', supermarket: 'lidl', calories: 2000, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 2, title: 'Lidl Cheap Student Meal Plan — 2,000 kcal', emphasis: 'minimal-effort' },
  { slug: 'asda-cheap-student-2000', goal: 'cheap-student', supermarket: 'asda', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Asda Student Meal Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-cheap-student-1500', goal: 'cheap-student', supermarket: 'tesco', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 0, title: 'Tesco Cheap Student Meal Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'aldi-cheap-student-veg-1800', goal: 'cheap-student', supermarket: 'aldi', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'low', mealSetIndex: 4, title: 'Aldi Vegetarian Cheap Student Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'lidl-cheap-student-veg-1800', goal: 'cheap-student', supermarket: 'lidl', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'low', mealSetIndex: 3, title: 'Lidl Vegetarian Cheap Student Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-cheap-student-vegan-1800', goal: 'cheap-student', supermarket: 'aldi', calories: 1800, dietType: 'vegan', budget: 'very-cheap', effort: 'low', mealSetIndex: 2, title: 'Aldi Vegan Cheap Student Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'asda-cheap-student-veg-1800', goal: 'cheap-student', supermarket: 'asda', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'low', mealSetIndex: 1, title: 'Asda Vegetarian Cheap Student Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'morrisons-cheap-student-1800', goal: 'cheap-student', supermarket: 'morrisons', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 0, title: 'Morrisons Cheap Student Meal Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'any-cheap-student-1800', goal: 'cheap-student', supermarket: 'any', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 1, title: 'Cheap Student Meal Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'any-cheap-student-1500', goal: 'cheap-student', supermarket: 'any', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 3, title: 'Cheap Student Meal Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'iceland-cheap-student-1500', goal: 'cheap-student', supermarket: 'iceland', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 2, title: 'Iceland Cheap Student Plan — 1,500 kcal', emphasis: 'frozen-friendly' },
  { slug: 'tesco-cheap-student-2000', goal: 'cheap-student', supermarket: 'tesco', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Tesco Student Meal Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-cheap-student-1800', goal: 'cheap-student', supermarket: 'sainsburys', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'low', mealSetIndex: 0, title: "Sainsbury's Cheap Student Meal Plan — 1,800 kcal", emphasis: 'minimal-effort' },
  { slug: 'lidl-cheap-student-vegan-1800', goal: 'cheap-student', supermarket: 'lidl', calories: 1800, dietType: 'vegan', budget: 'very-cheap', effort: 'low', mealSetIndex: 4, title: 'Lidl Vegan Cheap Student Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'asda-cheap-student-1500', goal: 'cheap-student', supermarket: 'asda', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'minimal', mealSetIndex: 3, title: 'Asda Quick Student Meal Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'morrisons-cheap-student-1500', goal: 'cheap-student', supermarket: 'morrisons', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 2, title: 'Morrisons Cheap Student Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'aldi-cheap-student-batch-2000', goal: 'cheap-student', supermarket: 'aldi', calories: 2000, dietType: 'standard', budget: 'very-cheap', effort: 'batch', mealSetIndex: 1, title: 'Aldi Student Batch Cook Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'any-cheap-student-veg-1800', goal: 'cheap-student', supermarket: 'any', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'low', mealSetIndex: 4, title: 'Vegetarian Cheap Student Meal Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'iceland-cheap-student-2000', goal: 'cheap-student', supermarket: 'iceland', calories: 2000, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 0, title: 'Iceland Student Meal Plan — 2,000 kcal', emphasis: 'frozen-friendly' },

  // ── BUSY PROFESSIONAL (20) ────────────────────────────────────────────────
  { slug: 'aldi-busy-professional-1800', goal: 'busy-professional', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 0, title: 'Aldi Busy Professional Meal Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'tesco-busy-professional-1800', goal: 'busy-professional', supermarket: 'tesco', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 1, title: 'Tesco Busy Professional Meal Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'sainsburys-busy-professional-2000', goal: 'busy-professional', supermarket: 'sainsburys', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 0, title: "Sainsbury's Busy Professional Plan — 2,000 kcal", emphasis: 'batch-cooking' },
  { slug: 'sainsburys-busy-professional-1800', goal: 'busy-professional', supermarket: 'sainsburys', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'minimal', mealSetIndex: 2, title: "Sainsbury's Busy Professional Plan — 1,800 kcal", emphasis: 'minimal-effort' },
  { slug: 'asda-busy-professional-1800', goal: 'busy-professional', supermarket: 'asda', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'minimal', mealSetIndex: 1, title: 'Asda Busy Professional Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'tesco-busy-professional-2000', goal: 'busy-professional', supermarket: 'tesco', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 3, title: 'Tesco Busy Professional Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'lidl-busy-professional-1800', goal: 'busy-professional', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 2, title: 'Lidl Busy Professional Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'morrisons-busy-professional-1800', goal: 'busy-professional', supermarket: 'morrisons', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 4, title: 'Morrisons Busy Professional Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'aldi-busy-professional-2000', goal: 'busy-professional', supermarket: 'aldi', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 3, title: 'Aldi Busy Professional Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'any-busy-professional-1800', goal: 'busy-professional', supermarket: 'any', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 0, title: 'Busy Professional Meal Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'tesco-busy-professional-veg-1800', goal: 'busy-professional', supermarket: 'tesco', calories: 1800, dietType: 'vegetarian', budget: 'moderate', effort: 'batch', mealSetIndex: 2, title: 'Tesco Vegetarian Busy Professional Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'asda-busy-professional-2000', goal: 'busy-professional', supermarket: 'asda', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'minimal', mealSetIndex: 4, title: 'Asda Busy Professional Plan — 2,000 kcal', emphasis: 'minimal-effort' },
  { slug: 'sainsburys-busy-professional-veg-1800', goal: 'busy-professional', supermarket: 'sainsburys', calories: 1800, dietType: 'vegetarian', budget: 'moderate', effort: 'minimal', mealSetIndex: 1, title: "Sainsbury's Vegetarian Busy Professional Plan — 1,800 kcal", emphasis: 'minimal-effort' },
  { slug: 'lidl-busy-professional-2000', goal: 'busy-professional', supermarket: 'lidl', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 0, title: 'Lidl Busy Professional Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'aldi-busy-professional-1800-v2', goal: 'busy-professional', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'minimal', mealSetIndex: 4, title: 'Aldi Quick Busy Professional Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'morrisons-busy-professional-2000', goal: 'busy-professional', supermarket: 'morrisons', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 3, title: 'Morrisons Busy Professional Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'any-busy-professional-2000', goal: 'busy-professional', supermarket: 'any', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 2, title: 'Busy Professional Meal Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'iceland-busy-professional-1800', goal: 'busy-professional', supermarket: 'iceland', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 1, title: 'Iceland Busy Professional Plan — 1,800 kcal', emphasis: 'frozen-friendly' },
  { slug: 'tesco-busy-professional-pesc-1800', goal: 'busy-professional', supermarket: 'tesco', calories: 1800, dietType: 'pescatarian', budget: 'moderate', effort: 'batch', mealSetIndex: 3, title: 'Tesco Pescatarian Busy Professional Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'asda-busy-professional-veg-1800', goal: 'busy-professional', supermarket: 'asda', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'batch', mealSetIndex: 0, title: 'Asda Vegetarian Busy Professional Plan — 1,800 kcal', emphasis: 'batch-cooking' },

  // ── LOW EFFORT (20) ───────────────────────────────────────────────────────
  { slug: 'aldi-low-effort-1800', goal: 'low-effort', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 0, title: 'Aldi Low Effort Meal Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'tesco-low-effort-1800', goal: 'low-effort', supermarket: 'tesco', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'minimal', mealSetIndex: 1, title: 'Tesco Low Effort Meal Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'asda-low-effort-1800', goal: 'low-effort', supermarket: 'asda', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'minimal', mealSetIndex: 2, title: 'Asda Low Effort Meal Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'iceland-low-effort-1800', goal: 'low-effort', supermarket: 'iceland', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 0, title: 'Iceland Low Effort Meal Plan — 1,800 kcal', emphasis: 'frozen-friendly' },
  { slug: 'lidl-low-effort-1800', goal: 'low-effort', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 3, title: 'Lidl Low Effort Meal Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'aldi-low-effort-1500', goal: 'low-effort', supermarket: 'aldi', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 4, title: 'Aldi Low Effort Meal Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'tesco-low-effort-2000', goal: 'low-effort', supermarket: 'tesco', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 2, title: 'Tesco Low Effort Meal Plan — 2,000 kcal', emphasis: 'minimal-effort' },
  { slug: 'asda-low-effort-1500', goal: 'low-effort', supermarket: 'asda', calories: 1500, dietType: 'standard', budget: 'budget', effort: 'minimal', mealSetIndex: 1, title: 'Asda Low Effort Meal Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'iceland-low-effort-1500', goal: 'low-effort', supermarket: 'iceland', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 3, title: 'Iceland Low Effort Meal Plan — 1,500 kcal', emphasis: 'frozen-friendly' },
  { slug: 'aldi-low-effort-veg-1800', goal: 'low-effort', supermarket: 'aldi', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 2, title: 'Aldi Vegetarian Low Effort Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'lidl-low-effort-1500', goal: 'low-effort', supermarket: 'lidl', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 0, title: 'Lidl Low Effort Meal Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'morrisons-low-effort-1800', goal: 'low-effort', supermarket: 'morrisons', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'minimal', mealSetIndex: 4, title: 'Morrisons Low Effort Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'sainsburys-low-effort-1800', goal: 'low-effort', supermarket: 'sainsburys', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'low', mealSetIndex: 1, title: "Sainsbury's Low Effort Plan — 1,800 kcal", emphasis: 'minimal-effort' },
  { slug: 'any-low-effort-1800', goal: 'low-effort', supermarket: 'any', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'minimal', mealSetIndex: 0, title: 'Low Effort Meal Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'any-low-effort-1500', goal: 'low-effort', supermarket: 'any', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 3, title: 'Low Effort Meal Plan — 1,500 kcal', emphasis: 'minimal-effort' },
  { slug: 'tesco-low-effort-veg-1800', goal: 'low-effort', supermarket: 'tesco', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'minimal', mealSetIndex: 4, title: 'Tesco Vegetarian Low Effort Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'asda-low-effort-vegan-1800', goal: 'low-effort', supermarket: 'asda', calories: 1800, dietType: 'vegan', budget: 'budget', effort: 'minimal', mealSetIndex: 2, title: 'Asda Vegan Low Effort Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'aldi-low-effort-2000', goal: 'low-effort', supermarket: 'aldi', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 1, title: 'Aldi Low Effort Plan — 2,000 kcal', emphasis: 'minimal-effort' },
  { slug: 'lidl-low-effort-veg-1800', goal: 'low-effort', supermarket: 'lidl', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'minimal', mealSetIndex: 3, title: 'Lidl Vegetarian Low Effort Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'iceland-low-effort-2000', goal: 'low-effort', supermarket: 'iceland', calories: 2000, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 4, title: 'Iceland Low Effort Plan — 2,000 kcal', emphasis: 'frozen-friendly' },

  // ── VEGETARIAN LOW CALORIE (15) ───────────────────────────────────────────
  { slug: 'aldi-veg-low-cal-1500', goal: 'vegetarian-low-cal', supermarket: 'aldi', calories: 1500, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Aldi Vegetarian Low Calorie Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-veg-low-cal-1800', goal: 'vegetarian-low-cal', supermarket: 'aldi', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 1, title: 'Aldi Vegetarian Low Calorie Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-veg-low-cal-1500', goal: 'vegetarian-low-cal', supermarket: 'tesco', calories: 1500, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Tesco Vegetarian Low Calorie Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-veg-low-cal-1800', goal: 'vegetarian-low-cal', supermarket: 'tesco', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'batch', mealSetIndex: 3, title: 'Tesco Vegetarian Low Calorie Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'asda-veg-low-cal-1500', goal: 'vegetarian-low-cal', supermarket: 'asda', calories: 1500, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Asda Vegetarian Low Calorie Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'asda-veg-low-cal-1800', goal: 'vegetarian-low-cal', supermarket: 'asda', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Asda Vegetarian Low Calorie Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'sainsburys-veg-low-cal-1500', goal: 'vegetarian-low-cal', supermarket: 'sainsburys', calories: 1500, dietType: 'vegetarian', budget: 'moderate', effort: 'standard', mealSetIndex: 1, title: "Sainsbury's Vegetarian Low Calorie Plan — 1,500 kcal", emphasis: 'whole-food' },
  { slug: 'lidl-veg-low-cal-1500', goal: 'vegetarian-low-cal', supermarket: 'lidl', calories: 1500, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 2, title: 'Lidl Vegetarian Low Calorie Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'morrisons-veg-low-cal-1800', goal: 'vegetarian-low-cal', supermarket: 'morrisons', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 3, title: 'Morrisons Vegetarian Low Calorie Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'any-veg-low-cal-1500', goal: 'vegetarian-low-cal', supermarket: 'any', calories: 1500, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Vegetarian Low Calorie Meal Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'any-veg-low-cal-1800', goal: 'vegetarian-low-cal', supermarket: 'any', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Vegetarian Low Calorie Meal Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-veg-low-cal-batch-1800', goal: 'vegetarian-low-cal', supermarket: 'aldi', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'batch', mealSetIndex: 4, title: 'Aldi Vegetarian Low Calorie Batch Cook Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'tesco-veg-low-cal-easy-1800', goal: 'vegetarian-low-cal', supermarket: 'tesco', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'low', mealSetIndex: 1, title: 'Tesco Easy Vegetarian Low Calorie Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'lidl-veg-low-cal-1800', goal: 'vegetarian-low-cal', supermarket: 'lidl', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Lidl Vegetarian Low Calorie Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'sainsburys-veg-low-cal-1800', goal: 'vegetarian-low-cal', supermarket: 'sainsburys', calories: 1800, dietType: 'vegetarian', budget: 'moderate', effort: 'standard', mealSetIndex: 3, title: "Sainsbury's Vegetarian Low Calorie Plan — 1,800 kcal", emphasis: 'whole-food' },

  // ── VEGAN LOW CALORIE (15) ────────────────────────────────────────────────
  { slug: 'aldi-vegan-low-cal-1500', goal: 'vegan-low-cal', supermarket: 'aldi', calories: 1500, dietType: 'vegan', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Aldi Vegan Low Calorie Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-vegan-low-cal-1800', goal: 'vegan-low-cal', supermarket: 'aldi', calories: 1800, dietType: 'vegan', budget: 'very-cheap', effort: 'standard', mealSetIndex: 1, title: 'Aldi Vegan Low Calorie Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-vegan-low-cal-1500', goal: 'vegan-low-cal', supermarket: 'tesco', calories: 1500, dietType: 'vegan', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Tesco Vegan Low Calorie Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-vegan-low-cal-1800', goal: 'vegan-low-cal', supermarket: 'tesco', calories: 1800, dietType: 'vegan', budget: 'budget', effort: 'batch', mealSetIndex: 3, title: 'Tesco Vegan Low Calorie Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'asda-vegan-low-cal-1500', goal: 'vegan-low-cal', supermarket: 'asda', calories: 1500, dietType: 'vegan', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Asda Vegan Low Calorie Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'asda-vegan-low-cal-1800', goal: 'vegan-low-cal', supermarket: 'asda', calories: 1800, dietType: 'vegan', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Asda Vegan Low Calorie Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'sainsburys-vegan-low-cal-1500', goal: 'vegan-low-cal', supermarket: 'sainsburys', calories: 1500, dietType: 'vegan', budget: 'moderate', effort: 'standard', mealSetIndex: 1, title: "Sainsbury's Vegan Low Calorie Plan — 1,500 kcal", emphasis: 'whole-food' },
  { slug: 'lidl-vegan-low-cal-1500', goal: 'vegan-low-cal', supermarket: 'lidl', calories: 1500, dietType: 'vegan', budget: 'very-cheap', effort: 'standard', mealSetIndex: 2, title: 'Lidl Vegan Low Calorie Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'morrisons-vegan-low-cal-1800', goal: 'vegan-low-cal', supermarket: 'morrisons', calories: 1800, dietType: 'vegan', budget: 'budget', effort: 'standard', mealSetIndex: 3, title: 'Morrisons Vegan Low Calorie Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'any-vegan-low-cal-1500', goal: 'vegan-low-cal', supermarket: 'any', calories: 1500, dietType: 'vegan', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Vegan Low Calorie Meal Plan — 1,500 kcal', emphasis: 'whole-food' },
  { slug: 'any-vegan-low-cal-1800', goal: 'vegan-low-cal', supermarket: 'any', calories: 1800, dietType: 'vegan', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Vegan Low Calorie Meal Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-vegan-low-cal-batch-1800', goal: 'vegan-low-cal', supermarket: 'aldi', calories: 1800, dietType: 'vegan', budget: 'very-cheap', effort: 'batch', mealSetIndex: 4, title: 'Aldi Vegan Low Calorie Batch Cook Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'tesco-vegan-low-cal-easy-1800', goal: 'vegan-low-cal', supermarket: 'tesco', calories: 1800, dietType: 'vegan', budget: 'budget', effort: 'low', mealSetIndex: 1, title: 'Tesco Easy Vegan Low Calorie Plan — 1,800 kcal', emphasis: 'minimal-effort' },
  { slug: 'lidl-vegan-low-cal-1800', goal: 'vegan-low-cal', supermarket: 'lidl', calories: 1800, dietType: 'vegan', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Lidl Vegan Low Calorie Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'sainsburys-vegan-low-cal-1800', goal: 'vegan-low-cal', supermarket: 'sainsburys', calories: 1800, dietType: 'vegan', budget: 'moderate', effort: 'standard', mealSetIndex: 3, title: "Sainsbury's Vegan Low Calorie Plan — 1,800 kcal", emphasis: 'whole-food' },

  // ── HIGH PROTEIN VEGETARIAN (15) ──────────────────────────────────────────
  { slug: 'aldi-hp-veg-1800', goal: 'high-protein-vegetarian', supermarket: 'aldi', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Aldi High Protein Vegetarian Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-hp-veg-1800', goal: 'high-protein-vegetarian', supermarket: 'tesco', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Tesco High Protein Vegetarian Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-hp-veg-1800', goal: 'high-protein-vegetarian', supermarket: 'asda', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Asda High Protein Vegetarian Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-hp-veg-1800', goal: 'high-protein-vegetarian', supermarket: 'sainsburys', calories: 1800, dietType: 'vegetarian', budget: 'moderate', effort: 'standard', mealSetIndex: 3, title: "Sainsbury's High Protein Vegetarian Plan — 1,800 kcal", emphasis: 'lean-protein' },
  { slug: 'lidl-hp-veg-1800', goal: 'high-protein-vegetarian', supermarket: 'lidl', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 4, title: 'Lidl High Protein Vegetarian Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'morrisons-hp-veg-1800', goal: 'high-protein-vegetarian', supermarket: 'morrisons', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Morrisons High Protein Vegetarian Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-hp-veg-2000', goal: 'high-protein-vegetarian', supermarket: 'aldi', calories: 2000, dietType: 'vegetarian', budget: 'budget', effort: 'batch', mealSetIndex: 2, title: 'Aldi High Protein Vegetarian Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'tesco-hp-veg-2000', goal: 'high-protein-vegetarian', supermarket: 'tesco', calories: 2000, dietType: 'vegetarian', budget: 'moderate', effort: 'standard', mealSetIndex: 1, title: 'Tesco High Protein Vegetarian Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-hp-veg-1500', goal: 'high-protein-vegetarian', supermarket: 'asda', calories: 1500, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 3, title: 'Asda High Protein Vegetarian Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'lidl-hp-veg-1500', goal: 'high-protein-vegetarian', supermarket: 'lidl', calories: 1500, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 4, title: 'Lidl High Protein Vegetarian Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'any-hp-veg-1800', goal: 'high-protein-vegetarian', supermarket: 'any', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'High Protein Vegetarian Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'any-hp-veg-2000', goal: 'high-protein-vegetarian', supermarket: 'any', calories: 2000, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'High Protein Vegetarian Meal Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-hp-veg-2000', goal: 'high-protein-vegetarian', supermarket: 'sainsburys', calories: 2000, dietType: 'vegetarian', budget: 'moderate', effort: 'batch', mealSetIndex: 1, title: "Sainsbury's High Protein Vegetarian Plan — 2,000 kcal", emphasis: 'batch-cooking' },
  { slug: 'morrisons-hp-veg-1500', goal: 'high-protein-vegetarian', supermarket: 'morrisons', calories: 1500, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 3, title: 'Morrisons High Protein Vegetarian Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-hp-veg-batch-1800', goal: 'high-protein-vegetarian', supermarket: 'aldi', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'batch', mealSetIndex: 4, title: 'Aldi High Protein Vegetarian Batch Cook Plan — 1,800 kcal', emphasis: 'batch-cooking' },

  // ── PESCATARIAN (10) ──────────────────────────────────────────────────────
  { slug: 'aldi-pescatarian-1800', goal: 'pescatarian', supermarket: 'aldi', calories: 1800, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Aldi Pescatarian Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-pescatarian-1800', goal: 'pescatarian', supermarket: 'tesco', calories: 1800, dietType: 'pescatarian', budget: 'moderate', effort: 'standard', mealSetIndex: 1, title: 'Tesco Pescatarian Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-pescatarian-1800', goal: 'pescatarian', supermarket: 'asda', calories: 1800, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Asda Pescatarian Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-pescatarian-1800', goal: 'pescatarian', supermarket: 'sainsburys', calories: 1800, dietType: 'pescatarian', budget: 'moderate', effort: 'standard', mealSetIndex: 3, title: "Sainsbury's Pescatarian Meal Plan — 1,800 kcal", emphasis: 'lean-protein' },
  { slug: 'lidl-pescatarian-1800', goal: 'pescatarian', supermarket: 'lidl', calories: 1800, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Lidl Pescatarian Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'morrisons-pescatarian-1800', goal: 'pescatarian', supermarket: 'morrisons', calories: 1800, dietType: 'pescatarian', budget: 'moderate', effort: 'standard', mealSetIndex: 0, title: 'Morrisons Pescatarian Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-pescatarian-1500', goal: 'pescatarian', supermarket: 'aldi', calories: 1500, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Aldi Pescatarian Meal Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-pescatarian-1500', goal: 'pescatarian', supermarket: 'tesco', calories: 1500, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Tesco Pescatarian Meal Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'any-pescatarian-1800', goal: 'pescatarian', supermarket: 'any', calories: 1800, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Pescatarian Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'any-pescatarian-1500', goal: 'pescatarian', supermarket: 'any', calories: 1500, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 3, title: 'Pescatarian Meal Plan — 1,500 kcal', emphasis: 'lean-protein' },

  // ── BUDGET BODYBUILDING (10) ──────────────────────────────────────────────
  { slug: 'aldi-budget-bodybuilding-2000', goal: 'budget-bodybuilding', supermarket: 'aldi', calories: 2000, dietType: 'standard', budget: 'very-cheap', effort: 'batch', mealSetIndex: 0, title: 'Aldi Budget Bodybuilding Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-budget-bodybuilding-2500', goal: 'budget-bodybuilding', supermarket: 'aldi', calories: 2500, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 1, title: 'Aldi Budget Bodybuilding Plan — 2,500 kcal', emphasis: 'batch-cooking' },
  { slug: 'lidl-budget-bodybuilding-2000', goal: 'budget-bodybuilding', supermarket: 'lidl', calories: 2000, dietType: 'standard', budget: 'very-cheap', effort: 'batch', mealSetIndex: 2, title: 'Lidl Budget Bodybuilding Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'asda-budget-bodybuilding-2000', goal: 'budget-bodybuilding', supermarket: 'asda', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 3, title: 'Asda Budget Bodybuilding Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-budget-bodybuilding-2000', goal: 'budget-bodybuilding', supermarket: 'tesco', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 4, title: 'Tesco Budget Bodybuilding Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'lidl-budget-bodybuilding-2500', goal: 'budget-bodybuilding', supermarket: 'lidl', calories: 2500, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 0, title: 'Lidl Budget Bodybuilding Plan — 2,500 kcal', emphasis: 'lean-protein' },
  { slug: 'iceland-budget-bodybuilding-2000', goal: 'budget-bodybuilding', supermarket: 'iceland', calories: 2000, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 2, title: 'Iceland Budget Bodybuilding Plan — 2,000 kcal', emphasis: 'frozen-friendly' },
  { slug: 'any-budget-bodybuilding-2000', goal: 'budget-bodybuilding', supermarket: 'any', calories: 2000, dietType: 'standard', budget: 'very-cheap', effort: 'batch', mealSetIndex: 1, title: 'Budget Bodybuilding Meal Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-budget-bodybuilding-veg-2000', goal: 'budget-bodybuilding', supermarket: 'aldi', calories: 2000, dietType: 'vegetarian', budget: 'budget', effort: 'batch', mealSetIndex: 3, title: 'Aldi Vegetarian Budget Bodybuilding Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'asda-budget-bodybuilding-2500', goal: 'budget-bodybuilding', supermarket: 'asda', calories: 2500, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 4, title: 'Asda Budget Bodybuilding Plan — 2,500 kcal', emphasis: 'lean-protein' },

  // ── GYM BEGINNER (10) ─────────────────────────────────────────────────────
  { slug: 'aldi-gym-beginner-1800', goal: 'gym-beginner', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 0, title: 'Aldi Gym Beginner Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-gym-beginner-1800', goal: 'gym-beginner', supermarket: 'tesco', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 1, title: 'Tesco Gym Beginner Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-gym-beginner-2000', goal: 'gym-beginner', supermarket: 'asda', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Asda Gym Beginner Meal Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-gym-beginner-2000', goal: 'gym-beginner', supermarket: 'sainsburys', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 3, title: "Sainsbury's Gym Beginner Plan — 2,000 kcal", emphasis: 'lean-protein' },
  { slug: 'lidl-gym-beginner-1800', goal: 'gym-beginner', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 4, title: 'Lidl Gym Beginner Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'morrisons-gym-beginner-1800', goal: 'gym-beginner', supermarket: 'morrisons', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 0, title: 'Morrisons Gym Beginner Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'any-gym-beginner-1800', goal: 'gym-beginner', supermarket: 'any', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 1, title: 'Gym Beginner Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'any-gym-beginner-2000', goal: 'gym-beginner', supermarket: 'any', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Gym Beginner Meal Plan — 2,000 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-gym-beginner-2000', goal: 'gym-beginner', supermarket: 'tesco', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 3, title: 'Tesco Gym Beginner Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'aldi-gym-beginner-2000', goal: 'gym-beginner', supermarket: 'aldi', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Aldi Gym Beginner Meal Plan — 2,000 kcal', emphasis: 'lean-protein' },

  // ── CHEAP HIGH PROTEIN (10) ───────────────────────────────────────────────
  { slug: 'aldi-cheap-hp-1800', goal: 'cheap-high-protein', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Aldi Cheap High Protein Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'lidl-cheap-hp-1800', goal: 'cheap-high-protein', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 1, title: 'Lidl Cheap High Protein Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-cheap-hp-1800', goal: 'cheap-high-protein', supermarket: 'asda', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 2, title: 'Asda Cheap High Protein Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-cheap-hp-1800', goal: 'cheap-high-protein', supermarket: 'tesco', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 3, title: 'Tesco Cheap High Protein Plan — 1,800 kcal', emphasis: 'batch-cooking' },
  { slug: 'iceland-cheap-hp-1800', goal: 'cheap-high-protein', supermarket: 'iceland', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'low', mealSetIndex: 4, title: 'Iceland Cheap High Protein Plan — 1,800 kcal', emphasis: 'frozen-friendly' },
  { slug: 'aldi-cheap-hp-2000', goal: 'cheap-high-protein', supermarket: 'aldi', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 1, title: 'Aldi Cheap High Protein Plan — 2,000 kcal', emphasis: 'batch-cooking' },
  { slug: 'lidl-cheap-hp-1500', goal: 'cheap-high-protein', supermarket: 'lidl', calories: 1500, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 0, title: 'Lidl Cheap High Protein Plan — 1,500 kcal', emphasis: 'lean-protein' },
  { slug: 'any-cheap-hp-1800', goal: 'cheap-high-protein', supermarket: 'any', calories: 1800, dietType: 'standard', budget: 'very-cheap', effort: 'standard', mealSetIndex: 2, title: 'Cheap High Protein Meal Plan — 1,800 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-cheap-hp-veg-1800', goal: 'cheap-high-protein', supermarket: 'aldi', calories: 1800, dietType: 'vegetarian', budget: 'very-cheap', effort: 'standard', mealSetIndex: 3, title: 'Aldi Cheap High Protein Vegetarian Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'morrisons-cheap-hp-1800', goal: 'cheap-high-protein', supermarket: 'morrisons', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 4, title: 'Morrisons Cheap High Protein Plan — 1,800 kcal', emphasis: 'lean-protein' },

  // ── MAINTENANCE (10) ─────────────────────────────────────────────────────
  { slug: 'aldi-maintenance-2000', goal: 'maintenance', supermarket: 'aldi', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 5, title: 'Aldi Maintenance Meal Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-maintenance-2000', goal: 'maintenance', supermarket: 'tesco', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 6, title: 'Tesco Maintenance Meal Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'asda-maintenance-2000', goal: 'maintenance', supermarket: 'asda', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 7, title: 'Asda Maintenance Meal Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'sainsburys-maintenance-2000', goal: 'maintenance', supermarket: 'sainsburys', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 5, title: "Sainsbury's Maintenance Meal Plan — 2,000 kcal", emphasis: 'whole-food' },
  { slug: 'lidl-maintenance-2000', goal: 'maintenance', supermarket: 'lidl', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 6, title: 'Lidl Maintenance Meal Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'morrisons-maintenance-2000', goal: 'maintenance', supermarket: 'morrisons', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 7, title: 'Morrisons Maintenance Meal Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'any-maintenance-2000', goal: 'maintenance', supermarket: 'any', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 5, title: 'Maintenance Meal Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-maintenance-veg-2000', goal: 'maintenance', supermarket: 'aldi', calories: 2000, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 8, title: 'Aldi Vegetarian Maintenance Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-maintenance-vegan-2000', goal: 'maintenance', supermarket: 'tesco', calories: 2000, dietType: 'vegan', budget: 'budget', effort: 'standard', mealSetIndex: 9, title: 'Tesco Vegan Maintenance Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'any-maintenance-pesc-2000', goal: 'maintenance', supermarket: 'any', calories: 2000, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 10, title: 'Pescatarian Maintenance Meal Plan — 2,000 kcal', emphasis: 'whole-food' },

  // ── ANTI-INFLAMMATORY (10) ────────────────────────────────────────────────
  { slug: 'aldi-anti-inflammatory-1800', goal: 'anti-inflammatory', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 11, title: 'Aldi Anti-Inflammatory Meal Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-anti-inflammatory-1800', goal: 'anti-inflammatory', supermarket: 'tesco', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 12, title: 'Tesco Anti-Inflammatory Meal Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'sainsburys-anti-inflammatory-2000', goal: 'anti-inflammatory', supermarket: 'sainsburys', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 11, title: "Sainsbury's Anti-Inflammatory Plan — 2,000 kcal", emphasis: 'whole-food' },
  { slug: 'asda-anti-inflammatory-1800', goal: 'anti-inflammatory', supermarket: 'asda', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 13, title: 'Asda Anti-Inflammatory Meal Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'lidl-anti-inflammatory-1800', goal: 'anti-inflammatory', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 12, title: 'Lidl Anti-Inflammatory Meal Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'morrisons-anti-inflammatory-1800', goal: 'anti-inflammatory', supermarket: 'morrisons', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 13, title: 'Morrisons Anti-Inflammatory Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-anti-inflammatory-veg-1800', goal: 'anti-inflammatory', supermarket: 'aldi', calories: 1800, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 14, title: 'Aldi Vegetarian Anti-Inflammatory Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-anti-inflammatory-vegan-1800', goal: 'anti-inflammatory', supermarket: 'tesco', calories: 1800, dietType: 'vegan', budget: 'budget', effort: 'standard', mealSetIndex: 14, title: 'Tesco Vegan Anti-Inflammatory Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'any-anti-inflammatory-1800', goal: 'anti-inflammatory', supermarket: 'any', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 15, title: 'Anti-Inflammatory Meal Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'sainsburys-anti-inflammatory-pesc-1800', goal: 'anti-inflammatory', supermarket: 'sainsburys', calories: 1800, dietType: 'pescatarian', budget: 'moderate', effort: 'standard', mealSetIndex: 15, title: "Sainsbury's Pescatarian Anti-Inflammatory Plan — 1,800 kcal", emphasis: 'whole-food' },

  // ── MENOPAUSE NUTRITION (10) ──────────────────────────────────────────────
  { slug: 'aldi-menopause-1800', goal: 'menopause-nutrition', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 16, title: 'Aldi Menopause Nutrition Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-menopause-1800', goal: 'menopause-nutrition', supermarket: 'tesco', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 17, title: 'Tesco Menopause Nutrition Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'sainsburys-menopause-1800', goal: 'menopause-nutrition', supermarket: 'sainsburys', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 16, title: "Sainsbury's Menopause Nutrition Plan — 1,800 kcal", emphasis: 'whole-food' },
  { slug: 'asda-menopause-1800', goal: 'menopause-nutrition', supermarket: 'asda', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 18, title: 'Asda Menopause Nutrition Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'morrisons-menopause-1800', goal: 'menopause-nutrition', supermarket: 'morrisons', calories: 1800, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 17, title: 'Morrisons Menopause Nutrition Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'lidl-menopause-1800', goal: 'menopause-nutrition', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 18, title: 'Lidl Menopause Nutrition Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'any-menopause-1800', goal: 'menopause-nutrition', supermarket: 'any', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 19, title: 'Menopause Nutrition Meal Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-menopause-veg-1800', goal: 'menopause-nutrition', supermarket: 'tesco', calories: 1800, dietType: 'vegetarian', budget: 'moderate', effort: 'standard', mealSetIndex: 19, title: 'Tesco Vegetarian Menopause Nutrition Plan — 1,800 kcal', emphasis: 'whole-food' },
  { slug: 'sainsburys-menopause-1600', goal: 'menopause-nutrition', supermarket: 'sainsburys', calories: 1600, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 20, title: "Sainsbury's Menopause Nutrition Plan — 1,600 kcal", emphasis: 'low-cal-swaps' },
  { slug: 'aldi-menopause-pesc-1800', goal: 'menopause-nutrition', supermarket: 'aldi', calories: 1800, dietType: 'pescatarian', budget: 'budget', effort: 'standard', mealSetIndex: 20, title: 'Aldi Pescatarian Menopause Nutrition Plan — 1,800 kcal', emphasis: 'whole-food' },

  // ── ENDURANCE & RUNNING (8) ───────────────────────────────────────────────
  { slug: 'aldi-endurance-2000', goal: 'endurance-athlete', supermarket: 'aldi', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 21, title: 'Aldi Endurance Athlete Meal Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-endurance-2200', goal: 'endurance-athlete', supermarket: 'tesco', calories: 2200, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 22, title: 'Tesco Endurance Athlete Plan — 2,200 kcal', emphasis: 'whole-food' },
  { slug: 'sainsburys-endurance-2500', goal: 'endurance-athlete', supermarket: 'sainsburys', calories: 2500, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 21, title: "Sainsbury's Endurance Athlete Plan — 2,500 kcal", emphasis: 'batch-cooking' },
  { slug: 'asda-endurance-2000', goal: 'endurance-athlete', supermarket: 'asda', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 23, title: 'Asda Endurance Athlete Meal Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'lidl-endurance-2000', goal: 'endurance-athlete', supermarket: 'lidl', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 22, title: 'Lidl Endurance Athlete Meal Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'any-endurance-2000', goal: 'endurance-athlete', supermarket: 'any', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 23, title: 'Endurance Athlete Meal Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'aldi-endurance-veg-2000', goal: 'endurance-athlete', supermarket: 'aldi', calories: 2000, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 24, title: 'Aldi Vegetarian Endurance Plan — 2,000 kcal', emphasis: 'whole-food' },
  { slug: 'tesco-endurance-pesc-2000', goal: 'endurance-athlete', supermarket: 'tesco', calories: 2000, dietType: 'pescatarian', budget: 'moderate', effort: 'standard', mealSetIndex: 24, title: 'Tesco Pescatarian Endurance Plan — 2,000 kcal', emphasis: 'whole-food' },

  // HIGH-CALORIE MUSCLE GAIN & ENDURANCE (16)
  { slug: 'any-muscle-gain-3000', goal: 'muscle-gain', supermarket: 'any', calories: 3000, dietType: 'standard', budget: 'flexible', effort: 'batch', mealSetIndex: 40, title: '3,000 Calorie Muscle Gain Meal Plan \u2014 3,000 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-muscle-gain-3000', goal: 'muscle-gain', supermarket: 'aldi', calories: 3000, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 41, title: 'Aldi 3,000 Calorie Muscle Gain Plan \u2014 3,000 kcal', emphasis: 'lean-protein' },
  { slug: 'lidl-budget-bodybuilding-3000', goal: 'budget-bodybuilding', supermarket: 'lidl', calories: 3000, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 42, title: 'Lidl 3,000 Calorie Budget Bodybuilding Plan \u2014 3,000 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-muscle-gain-3000', goal: 'muscle-gain', supermarket: 'tesco', calories: 3000, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 43, title: 'Tesco 3,000 Calorie Muscle Gain Plan \u2014 3,000 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-muscle-gain-3000', goal: 'muscle-gain', supermarket: 'asda', calories: 3000, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 44, title: 'Asda 3,000 Calorie Muscle Gain Plan \u2014 3,000 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-endurance-3000', goal: 'endurance-athlete', supermarket: 'sainsburys', calories: 3000, dietType: 'standard', budget: 'flexible', effort: 'standard', mealSetIndex: 45, title: "Sainsbury's 3,000 Calorie Endurance Plan \u2014 3,000 kcal", emphasis: 'whole-food' },
  { slug: 'morrisons-muscle-gain-3000', goal: 'muscle-gain', supermarket: 'morrisons', calories: 3000, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 46, title: 'Morrisons 3,000 Calorie Muscle Gain Plan \u2014 3,000 kcal', emphasis: 'lean-protein' },
  { slug: 'iceland-budget-bodybuilding-3000', goal: 'budget-bodybuilding', supermarket: 'iceland', calories: 3000, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 47, title: 'Iceland 3,000 Calorie Budget Bodybuilding Plan \u2014 3,000 kcal', emphasis: 'frozen-friendly' },
  { slug: 'any-muscle-gain-3500', goal: 'muscle-gain', supermarket: 'any', calories: 3500, dietType: 'standard', budget: 'flexible', effort: 'batch', mealSetIndex: 48, title: '3,500 Calorie Muscle Gain Meal Plan \u2014 3,500 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-budget-bodybuilding-3500', goal: 'budget-bodybuilding', supermarket: 'aldi', calories: 3500, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 49, title: 'Aldi 3,500 Calorie Budget Bodybuilding Plan \u2014 3,500 kcal', emphasis: 'lean-protein' },
  { slug: 'lidl-budget-bodybuilding-3500', goal: 'budget-bodybuilding', supermarket: 'lidl', calories: 3500, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 50, title: 'Lidl 3,500 Calorie Budget Bodybuilding Plan \u2014 3,500 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-muscle-gain-3500', goal: 'muscle-gain', supermarket: 'tesco', calories: 3500, dietType: 'standard', budget: 'flexible', effort: 'batch', mealSetIndex: 51, title: 'Tesco 3,500 Calorie Muscle Gain Plan \u2014 3,500 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-muscle-gain-3500', goal: 'muscle-gain', supermarket: 'asda', calories: 3500, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 52, title: 'Asda 3,500 Calorie Muscle Gain Plan \u2014 3,500 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-endurance-3500', goal: 'endurance-athlete', supermarket: 'sainsburys', calories: 3500, dietType: 'standard', budget: 'flexible', effort: 'standard', mealSetIndex: 53, title: "Sainsbury's 3,500 Calorie Endurance Plan \u2014 3,500 kcal", emphasis: 'whole-food' },
  { slug: 'morrisons-muscle-gain-3500', goal: 'muscle-gain', supermarket: 'morrisons', calories: 3500, dietType: 'standard', budget: 'flexible', effort: 'batch', mealSetIndex: 54, title: 'Morrisons 3,500 Calorie Muscle Gain Plan \u2014 3,500 kcal', emphasis: 'lean-protein' },
  { slug: 'iceland-muscle-gain-3500', goal: 'muscle-gain', supermarket: 'iceland', calories: 3500, dietType: 'standard', budget: 'budget', effort: 'low', mealSetIndex: 55, title: 'Iceland 3,500 Calorie Muscle Gain Plan \u2014 3,500 kcal', emphasis: 'frozen-friendly' },

  // ── BODY RECOMPOSITION (10) ─────────────────────────────────────────────────
  { slug: 'aldi-body-recomp-1800', goal: 'body-recomp', supermarket: 'aldi', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 30, title: 'Aldi Body Recomposition Meal Plan — 1,800 kcal', emphasis: 'recomp-protein' },
  { slug: 'tesco-body-recomp-2000', goal: 'body-recomp', supermarket: 'tesco', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'batch', mealSetIndex: 31, title: 'Tesco Body Recomposition Plan — 2,000 kcal', emphasis: 'recomp-protein' },
  { slug: 'asda-body-recomp-2000', goal: 'body-recomp', supermarket: 'asda', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 32, title: 'Asda Body Recomposition Meal Plan — 2,000 kcal', emphasis: 'recomp-protein' },
  { slug: 'lidl-body-recomp-1800', goal: 'body-recomp', supermarket: 'lidl', calories: 1800, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 33, title: 'Lidl Body Recomposition Meal Plan — 1,800 kcal', emphasis: 'recomp-protein' },
  { slug: 'sainsburys-body-recomp-2200', goal: 'body-recomp', supermarket: 'sainsburys', calories: 2200, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 34, title: "Sainsbury's Body Recomposition Plan — 2,200 kcal", emphasis: 'recomp-protein' },
  { slug: 'morrisons-body-recomp-2000', goal: 'body-recomp', supermarket: 'morrisons', calories: 2000, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 35, title: 'Morrisons Body Recomposition Plan — 2,000 kcal', emphasis: 'recomp-protein' },
  { slug: 'any-body-recomp-2000', goal: 'body-recomp', supermarket: 'any', calories: 2000, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 36, title: 'Body Recomposition Meal Plan — 2,000 kcal', emphasis: 'recomp-protein' },
  { slug: 'aldi-body-recomp-veg-2000', goal: 'body-recomp', supermarket: 'aldi', calories: 2000, dietType: 'vegetarian', budget: 'budget', effort: 'standard', mealSetIndex: 37, title: 'Aldi Vegetarian Body Recomposition Plan — 2,000 kcal', emphasis: 'recomp-protein' },
  { slug: 'tesco-body-recomp-pesc-2000', goal: 'body-recomp', supermarket: 'tesco', calories: 2000, dietType: 'pescatarian', budget: 'moderate', effort: 'standard', mealSetIndex: 38, title: 'Tesco Pescatarian Body Recomposition Plan — 2,000 kcal', emphasis: 'recomp-protein' },
  { slug: 'asda-body-recomp-2200', goal: 'body-recomp', supermarket: 'asda', calories: 2200, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 39, title: 'Asda Body Recomposition Batch Plan — 2,200 kcal', emphasis: 'recomp-protein' },

  // ── CUTTING PHASE (10) ────────────────────────────────────────────────────
  { slug: 'aldi-cutting-1400', goal: 'cutting', supermarket: 'aldi', calories: 1400, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 25, title: 'Aldi Cutting Phase Meal Plan — 1,400 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-cutting-1400', goal: 'cutting', supermarket: 'tesco', calories: 1400, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 26, title: 'Tesco Cutting Phase Meal Plan — 1,400 kcal', emphasis: 'lean-protein' },
  { slug: 'asda-cutting-1400', goal: 'cutting', supermarket: 'asda', calories: 1400, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 25, title: 'Asda Cutting Phase Meal Plan — 1,400 kcal', emphasis: 'lean-protein' },
  { slug: 'aldi-cutting-1600', goal: 'cutting', supermarket: 'aldi', calories: 1600, dietType: 'standard', budget: 'budget', effort: 'batch', mealSetIndex: 27, title: 'Aldi Cutting Phase Meal Plan — 1,600 kcal', emphasis: 'lean-protein' },
  { slug: 'lidl-cutting-1400', goal: 'cutting', supermarket: 'lidl', calories: 1400, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 26, title: 'Lidl Cutting Phase Meal Plan — 1,400 kcal', emphasis: 'lean-protein' },
  { slug: 'sainsburys-cutting-1600', goal: 'cutting', supermarket: 'sainsburys', calories: 1600, dietType: 'standard', budget: 'moderate', effort: 'standard', mealSetIndex: 27, title: "Sainsbury's Cutting Phase Plan — 1,600 kcal", emphasis: 'lean-protein' },
  { slug: 'morrisons-cutting-1400', goal: 'cutting', supermarket: 'morrisons', calories: 1400, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 28, title: 'Morrisons Cutting Phase Plan — 1,400 kcal', emphasis: 'lean-protein' },
  { slug: 'any-cutting-1400', goal: 'cutting', supermarket: 'any', calories: 1400, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 28, title: 'Cutting Phase Meal Plan — 1,400 kcal', emphasis: 'lean-protein' },
  { slug: 'any-cutting-1600', goal: 'cutting', supermarket: 'any', calories: 1600, dietType: 'standard', budget: 'budget', effort: 'standard', mealSetIndex: 29, title: 'Cutting Phase Meal Plan — 1,600 kcal', emphasis: 'lean-protein' },
  { slug: 'tesco-cutting-pesc-1500', goal: 'cutting', supermarket: 'tesco', calories: 1500, dietType: 'pescatarian', budget: 'moderate', effort: 'standard', mealSetIndex: 29, title: 'Tesco Pescatarian Cutting Phase Plan — 1,500 kcal', emphasis: 'lean-protein' },
];

const MARKET_TITLES = {
  aldi: 'Aldi',
  lidl: 'Lidl',
  tesco: 'Tesco',
  asda: 'Asda',
  sainsburys: "Sainsbury's",
  morrisons: 'Morrisons',
  iceland: 'Iceland',
  waitrose: 'Waitrose',
  ocado: 'Ocado',
  'marks-spencer': 'M&S',
  coop: 'Co-op',
};

const DIET_TITLES = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  pescatarian: 'Pescatarian',
};

const GOAL_TITLES = {
  'weight-loss': 'Weight Loss',
  'high-protein-low-cal': 'High Protein Low Calorie',
  'muscle-gain': 'Muscle Gain',
  'budget-fat-loss': 'Budget Fat Loss',
  'cheap-student': 'Cheap Student',
  'busy-professional': 'Busy Professional',
  'low-effort': 'Low Effort',
  'vegetarian-low-cal': 'Vegetarian Low Calorie',
  'vegan-low-cal': 'Vegan Low Calorie',
  'high-protein-vegetarian': 'High Protein Vegetarian',
  pescatarian: 'Pescatarian',
  'budget-bodybuilding': 'Budget Bodybuilding',
  'gym-beginner': 'Gym Beginner',
  'cheap-high-protein': 'Cheap High Protein',
  maintenance: 'Maintenance',
  'anti-inflammatory': 'Anti-Inflammatory',
  'menopause-nutrition': 'Menopause Nutrition',
  'endurance-athlete': 'Endurance Athlete',
  'body-recomp': 'Body Recomposition',
  cutting: 'Cutting Phase',
};

const GOALS_WITH_DIET_IN_TITLE = new Set([
  'vegetarian-low-cal',
  'vegan-low-cal',
  'high-protein-vegetarian',
  'pescatarian',
]);

// A second curated wave: one complementary variant for every original seed.
// The variants keep the same supermarket, calorie target, budget, and diet rules,
// while changing the prep style, macro emphasis, and meal selection offset.
const EXPANSION_STYLES = {
  'weight-loss': [
    { slug: 'high-fibre', label: 'High-Fibre', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'meal-prep', label: 'Meal Prep', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'quick-prep', label: 'Quick Prep', effort: 'low', emphasis: 'minimal-effort' },
    { slug: 'lean-protein', label: 'Lean Protein', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'low-cal-swaps', label: 'Low-Calorie Swaps', effort: 'minimal', emphasis: 'low-cal-swaps' },
  ],
  'high-protein-low-cal': [
    { slug: 'lean-protein', label: 'Lean', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'quick-prep', label: 'Quick Prep', effort: 'low', emphasis: 'minimal-effort' },
    { slug: 'high-variety', label: 'High-Variety', effort: 'high-variety', emphasis: 'high-variety' },
    { slug: 'budget-smart', label: 'Budget-Smart', effort: 'standard', emphasis: 'low-cal-swaps' },
  ],
  'muscle-gain': [
    { slug: 'clean-bulk', label: 'Clean Bulk', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'training-day', label: 'Training Day', effort: 'standard', emphasis: 'performance-protein' },
    { slug: 'meal-prep', label: 'Meal Prep', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'high-variety', label: 'High-Variety', effort: 'high-variety', emphasis: 'high-variety' },
    { slug: 'budget-bulk', label: 'Budget Bulk', effort: 'standard', emphasis: 'performance-protein' },
  ],
  'budget-fat-loss': [
    { slug: 'budget-smart', label: 'Best-Value', effort: 'standard', emphasis: 'low-cal-swaps' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'freezer-friendly', label: 'Freezer-Friendly', effort: 'low', emphasis: 'frozen-friendly' },
    { slug: 'high-fibre', label: 'High-Fibre', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'simple-prep', label: 'Simple Prep', effort: 'minimal', emphasis: 'minimal-effort' },
  ],
  'cheap-student': [
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'no-fuss', label: 'No-Fuss', effort: 'minimal', emphasis: 'minimal-effort' },
    { slug: 'one-pan', label: 'One-Pan', effort: 'low', emphasis: 'frozen-friendly' },
    { slug: 'high-protein', label: 'High-Protein', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'freezer-friendly', label: 'Freezer-Friendly', effort: 'low', emphasis: 'frozen-friendly' },
  ],
  'busy-professional': [
    { slug: 'workweek-prep', label: 'Workweek Prep', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'grab-and-go', label: 'Grab-and-Go', effort: 'minimal', emphasis: 'minimal-effort' },
    { slug: 'twenty-minute', label: '20-Minute', effort: 'low', emphasis: 'minimal-effort' },
    { slug: 'desk-lunch', label: 'Desk Lunch', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'high-variety', label: 'High-Variety', effort: 'high-variety', emphasis: 'high-variety' },
  ],
  'low-effort': [
    { slug: 'no-cook', label: 'No-Cook', effort: 'minimal', emphasis: 'minimal-effort' },
    { slug: 'fifteen-minute', label: '15-Minute', effort: 'low', emphasis: 'minimal-effort' },
    { slug: 'microwave-friendly', label: 'Microwave-Friendly', effort: 'minimal', emphasis: 'frozen-friendly' },
    { slug: 'simple-protein', label: 'Simple High-Protein', effort: 'low', emphasis: 'lean-protein' },
    { slug: 'batch-light', label: 'Light Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
  ],
  'vegetarian-low-cal': [
    { slug: 'high-fibre', label: 'High-Fibre', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'high-protein', label: 'High-Protein', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'quick-prep', label: 'Quick Prep', effort: 'low', emphasis: 'minimal-effort' },
    { slug: 'whole-food', label: 'Whole-Food', effort: 'standard', emphasis: 'whole-food' },
  ],
  'vegan-low-cal': [
    { slug: 'high-fibre', label: 'High-Fibre', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'protein-focused', label: 'Protein-Focused', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'quick-prep', label: 'Quick Prep', effort: 'low', emphasis: 'minimal-effort' },
    { slug: 'whole-food', label: 'Whole-Food', effort: 'standard', emphasis: 'whole-food' },
  ],
  'high-protein-vegetarian': [
    { slug: 'protein-focused', label: 'Protein-Focused', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'training-day', label: 'Training Day', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'budget-smart', label: 'Budget-Smart', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'high-variety', label: 'High-Variety', effort: 'high-variety', emphasis: 'high-variety' },
  ],
  pescatarian: [
    { slug: 'omega-three', label: 'Omega-3', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'high-protein', label: 'High-Protein', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'quick-prep', label: 'Quick Prep', effort: 'low', emphasis: 'minimal-effort' },
    { slug: 'mediterranean', label: 'Mediterranean', effort: 'high-variety', emphasis: 'high-variety' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
  ],
  'budget-bodybuilding': [
    { slug: 'lean-bulk', label: 'Lean Bulk', effort: 'standard', emphasis: 'performance-protein' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'budget-protein', label: 'Protein-Focused', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'training-day', label: 'Training Day', effort: 'standard', emphasis: 'performance-protein' },
    { slug: 'high-calorie', label: 'Higher-Calorie', effort: 'standard', emphasis: 'high-carb-fuel' },
  ],
  'gym-beginner': [
    { slug: 'simple-gym', label: 'Simple Gym', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'training-day', label: 'Training Day', effort: 'standard', emphasis: 'performance-protein' },
    { slug: 'meal-prep', label: 'Meal Prep', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'high-protein', label: 'High-Protein', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'budget-smart', label: 'Budget-Smart', effort: 'standard', emphasis: 'low-cal-swaps' },
  ],
  'cheap-high-protein': [
    { slug: 'best-value', label: 'Best-Value', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'lean-protein', label: 'Lean Protein', effort: 'standard', emphasis: 'performance-protein' },
    { slug: 'simple-prep', label: 'Simple Prep', effort: 'low', emphasis: 'minimal-effort' },
    { slug: 'tinned-and-frozen', label: 'Tinned & Frozen', effort: 'minimal', emphasis: 'frozen-friendly' },
  ],
  maintenance: [
    { slug: 'balanced', label: 'Balanced', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'high-fibre', label: 'High-Fibre', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'meal-prep', label: 'Meal Prep', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'quick-prep', label: 'Quick Prep', effort: 'low', emphasis: 'minimal-effort' },
    { slug: 'high-variety', label: 'High-Variety', effort: 'high-variety', emphasis: 'high-variety' },
  ],
  'anti-inflammatory': [
    { slug: 'omega-three', label: 'Omega-3', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'mediterranean', label: 'Mediterranean', effort: 'high-variety', emphasis: 'high-variety' },
    { slug: 'high-fibre', label: 'High-Fibre', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'plant-forward', label: 'Plant-Forward', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
  ],
  'menopause-nutrition': [
    { slug: 'high-protein', label: 'High-Protein', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'calcium-rich', label: 'Calcium-Rich', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'high-fibre', label: 'High-Fibre', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'balanced', label: 'Balanced', effort: 'standard', emphasis: 'whole-food' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
  ],
  'endurance-athlete': [
    { slug: 'long-run-fuel', label: 'Long-Run Fuel', effort: 'standard', emphasis: 'high-carb-fuel' },
    { slug: 'training-day', label: 'Training Day', effort: 'standard', emphasis: 'performance-protein' },
    { slug: 'recovery', label: 'Recovery', effort: 'standard', emphasis: 'performance-protein' },
    { slug: 'higher-carb', label: 'Higher-Carb', effort: 'standard', emphasis: 'high-carb-fuel' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
  ],
  'body-recomp': [
    { slug: 'lean-recomp', label: 'Lean', effort: 'standard', emphasis: 'recomp-protein' },
    { slug: 'training-day', label: 'Training Day', effort: 'standard', emphasis: 'performance-protein' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'high-protein', label: 'High-Protein', effort: 'standard', emphasis: 'performance-protein' },
    { slug: 'high-variety', label: 'High-Variety', effort: 'high-variety', emphasis: 'high-variety' },
  ],
  cutting: [
    { slug: 'lean-cut', label: 'Lean', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'high-protein', label: 'High-Protein', effort: 'standard', emphasis: 'lean-protein' },
    { slug: 'batch-cook', label: 'Batch Cook', effort: 'batch', emphasis: 'batch-cooking' },
    { slug: 'low-calorie', label: 'Low-Calorie', effort: 'standard', emphasis: 'low-cal-swaps' },
    { slug: 'quick-prep', label: 'Quick Prep', effort: 'low', emphasis: 'minimal-effort' },
  ],
};

function buildExpandedPlanSeed(seed, index) {
  const styles = EXPANSION_STYLES[seed.goal] || EXPANSION_STYLES['weight-loss'];
  const style = styles[index % styles.length];
  const titleStyle = { ...style, label: getDistinctStyleLabel(seed, style) };

  return {
    ...seed,
    slug: `${seed.slug}-${style.slug}`,
    effort: style.effort,
    emphasis: style.emphasis,
    mealSetIndex: seed.mealSetIndex + 31 + (index % 37),
    title: buildExpandedTitle(seed, titleStyle),
  };
}

function getDistinctStyleLabel(seed, style) {
  if (/-v\d($|-)/.test(seed.slug)) return `Alternative ${style.label}`;
  if (seed.slug.includes('-batch-') && style.slug === 'batch-cook') return 'Sunday Prep';
  return style.label;
}

function buildExpandedTitle(seed, style) {
  const market = seed.supermarket === 'any' ? '' : `${MARKET_TITLES[seed.supermarket]} `;
  const diet = seed.dietType !== 'standard' && !GOALS_WITH_DIET_IN_TITLE.has(seed.goal)
    ? `${DIET_TITLES[seed.dietType]} `
    : '';
  const goal = GOAL_TITLES[seed.goal] || seed.goal;
  return `${market}${diet}${style.label} ${goal} Plan \u2014 ${seed.calories.toLocaleString('en-GB')} kcal`;
}

const TARGET_PLAN_COUNT = 1000;

const DEEP_EXPANSION_STYLE_LIBRARY = {
  'balanced-plate': { slug: 'balanced-plate', label: 'Balanced Plate', effort: 'standard', emphasis: 'whole-food' },
  'five-a-day': { slug: 'five-a-day', label: '5-a-Day', effort: 'standard', emphasis: 'whole-food' },
  wholegrain: { slug: 'wholegrain', label: 'Wholegrain', effort: 'standard', emphasis: 'whole-food' },
  'batch-friendly': { slug: 'batch-friendly', label: 'Batch-Friendly', effort: 'batch', emphasis: 'batch-cooking' },
  'freezer-friendly': { slug: 'freezer-friendly', label: 'Freezer-Friendly', effort: 'low', emphasis: 'frozen-friendly' },
  'work-lunch': { slug: 'work-lunch', label: 'Work Lunch', effort: 'low', emphasis: 'minimal-effort' },
  'printable-prep': { slug: 'printable-prep', label: 'Printable Prep', effort: 'batch', emphasis: 'batch-cooking' },
  'quick-shop': { slug: 'quick-shop', label: 'Quick Shop', effort: 'low', emphasis: 'minimal-effort' },
  'higher-protein': { slug: 'higher-protein', label: 'Higher-Protein', effort: 'standard', emphasis: 'lean-protein' },
  'high-fibre': { slug: 'high-fibre', label: 'High-Fibre', effort: 'standard', emphasis: 'whole-food' },
  'cook-once': { slug: 'cook-once', label: 'Cook-Once', effort: 'batch', emphasis: 'batch-cooking' },
  'family-friendly': { slug: 'family-friendly', label: 'Family-Friendly', effort: 'standard', emphasis: 'high-variety' },
  'low-fuss': { slug: 'low-fuss', label: 'Low-Fuss', effort: 'minimal', emphasis: 'minimal-effort' },
  'budget-smart': { slug: 'budget-smart', label: 'Budget-Smart', effort: 'standard', emphasis: 'low-cal-swaps' },
  'performance-protein': { slug: 'performance-protein', label: 'High-Protein High-Carb', effort: 'standard', emphasis: 'performance-protein' },
  'high-carb-fuel': { slug: 'high-carb-fuel', label: 'High-Carb Fuel', effort: 'standard', emphasis: 'high-carb-fuel' },
  'training-day': { slug: 'training-day', label: 'Training Day', effort: 'standard', emphasis: 'performance-protein' },
  recovery: { slug: 'recovery', label: 'Recovery', effort: 'standard', emphasis: 'performance-protein' },
  'omega-three': { slug: 'omega-three', label: 'Omega-3', effort: 'standard', emphasis: 'whole-food' },
  'calcium-rich': { slug: 'calcium-rich', label: 'Calcium-Rich', effort: 'standard', emphasis: 'whole-food' },
  'lower-sugar': { slug: 'lower-sugar', label: 'Lower-Sugar', effort: 'standard', emphasis: 'whole-food' },
  'plant-forward': { slug: 'plant-forward', label: 'Plant-Forward', effort: 'standard', emphasis: 'whole-food' },
  'tinned-and-frozen': { slug: 'tinned-and-frozen', label: 'Tinned & Frozen', effort: 'minimal', emphasis: 'frozen-friendly' },
  'desk-lunch': { slug: 'desk-lunch', label: 'Desk Lunch', effort: 'low', emphasis: 'lean-protein' },
  'sunday-prep': { slug: 'sunday-prep', label: 'Sunday Prep', effort: 'batch', emphasis: 'batch-cooking' },
};

const DEFAULT_DEEP_STYLE_SLUGS = [
  'balanced-plate',
  'five-a-day',
  'wholegrain',
  'batch-friendly',
  'freezer-friendly',
  'quick-shop',
  'family-friendly',
  'printable-prep',
];

const DEEP_STYLE_SLUGS_BY_GOAL = {
  'weight-loss': ['five-a-day', 'high-fibre', 'balanced-plate', 'lower-sugar', 'batch-friendly', 'quick-shop', 'work-lunch'],
  'high-protein-low-cal': ['higher-protein', 'desk-lunch', 'high-fibre', 'batch-friendly', 'low-fuss', 'balanced-plate'],
  'muscle-gain': ['performance-protein', 'training-day', 'high-carb-fuel', 'higher-protein', 'recovery', 'wholegrain', 'batch-friendly', 'quick-shop'],
  'budget-fat-loss': ['budget-smart', 'tinned-and-frozen', 'cook-once', 'freezer-friendly', 'low-fuss', 'high-fibre'],
  'cheap-student': ['budget-smart', 'tinned-and-frozen', 'low-fuss', 'cook-once', 'quick-shop', 'higher-protein'],
  'busy-professional': ['desk-lunch', 'work-lunch', 'quick-shop', 'sunday-prep', 'batch-friendly', 'low-fuss'],
  'low-effort': ['low-fuss', 'quick-shop', 'freezer-friendly', 'work-lunch', 'tinned-and-frozen', 'printable-prep'],
  'vegetarian-low-cal': ['plant-forward', 'high-fibre', 'five-a-day', 'batch-friendly', 'wholegrain', 'higher-protein'],
  'vegan-low-cal': ['plant-forward', 'high-fibre', 'five-a-day', 'batch-friendly', 'wholegrain', 'lower-sugar'],
  'high-protein-vegetarian': ['higher-protein', 'plant-forward', 'batch-friendly', 'wholegrain', 'desk-lunch', 'recovery'],
  pescatarian: ['omega-three', 'higher-protein', 'balanced-plate', 'batch-friendly', 'quick-shop', 'work-lunch'],
  'budget-bodybuilding': ['performance-protein', 'high-carb-fuel', 'higher-protein', 'budget-smart', 'training-day', 'batch-friendly', 'tinned-and-frozen', 'wholegrain'],
  'gym-beginner': ['performance-protein', 'higher-protein', 'training-day', 'balanced-plate', 'batch-friendly', 'quick-shop', 'recovery'],
  'cheap-high-protein': ['performance-protein', 'higher-protein', 'budget-smart', 'tinned-and-frozen', 'cook-once', 'low-fuss', 'desk-lunch'],
  maintenance: ['balanced-plate', 'five-a-day', 'wholegrain', 'family-friendly', 'cook-once', 'quick-shop'],
  'anti-inflammatory': ['omega-three', 'plant-forward', 'high-fibre', 'five-a-day', 'balanced-plate', 'wholegrain'],
  'menopause-nutrition': ['calcium-rich', 'higher-protein', 'high-fibre', 'balanced-plate', 'batch-friendly', 'five-a-day'],
  'endurance-athlete': ['high-carb-fuel', 'performance-protein', 'training-day', 'recovery', 'wholegrain', 'batch-friendly', 'quick-shop', 'balanced-plate'],
  'body-recomp': ['performance-protein', 'higher-protein', 'training-day', 'desk-lunch', 'batch-friendly', 'balanced-plate', 'recovery'],
  cutting: ['higher-protein', 'high-fibre', 'lower-sugar', 'desk-lunch', 'batch-friendly', 'low-fuss'],
};

const VEGAN_VARIANT_UNSUITABLE_GOALS = new Set([
  'muscle-gain',
  'budget-bodybuilding',
  'endurance-athlete',
]);

export const COVERAGE_FILTER_VALUES = {
  goals: [
    'weight-loss',
    'budget-fat-loss',
    'high-protein-low-cal',
    'muscle-gain',
    'body-recomp',
    'gym-beginner',
    'budget-bodybuilding',
    'cheap-student',
    'cheap-high-protein',
    'low-effort',
    'busy-professional',
    'vegetarian-low-cal',
    'vegan-low-cal',
    'high-protein-vegetarian',
    'pescatarian',
    'maintenance',
    'anti-inflammatory',
    'menopause-nutrition',
    'endurance-athlete',
    'cutting',
  ],
  supermarkets: ['any', 'aldi', 'lidl', 'tesco', 'asda', 'sainsburys', 'morrisons', 'iceland', 'waitrose', 'ocado', 'marks-spencer', 'coop'],
  dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
  calories: [1400, 1500, 1600, 1800, 2000, 2200, 2500, 3000, 3500],
  budgets: ['very-cheap', 'budget', 'moderate', 'flexible'],
  efforts: ['minimal', 'low', 'standard', 'batch', 'high-variety'],
};

export const COVERAGE_GOAL_PROFILES = {
  'weight-loss': {
    calories: [1400, 1500, 1600, 1800, 2000],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'low-cal-swaps',
  },
  'budget-fat-loss': {
    calories: [1400, 1500, 1600, 1800, 2000],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'low-cal-swaps',
  },
  'high-protein-low-cal': {
    calories: [1400, 1500, 1600, 1800, 2000],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'lean-protein',
  },
  'muscle-gain': {
    calories: [2000, 2200, 2500, 3000, 3500],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'performance-protein',
  },
  'body-recomp': {
    calories: [1500, 1600, 1800, 2000, 2200, 2500],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'performance-protein',
  },
  'gym-beginner': {
    calories: [1500, 1600, 1800, 2000, 2200, 2500],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'performance-protein',
  },
  'budget-bodybuilding': {
    calories: [2000, 2200, 2500, 3000, 3500],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'performance-protein',
  },
  'cheap-student': {
    calories: [1400, 1500, 1600, 1800, 2000, 2200, 2500],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'low-cal-swaps',
  },
  'cheap-high-protein': {
    calories: [1400, 1500, 1600, 1800, 2000, 2200, 2500],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'performance-protein',
  },
  'low-effort': {
    calories: [1400, 1500, 1600, 1800, 2000, 2200, 2500, 3000, 3500],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'minimal-effort',
  },
  'busy-professional': {
    calories: [1400, 1500, 1600, 1800, 2000, 2200, 2500, 3000],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'minimal-effort',
  },
  'vegetarian-low-cal': {
    calories: [1400, 1500, 1600, 1800, 2000],
    dietTypes: ['vegetarian'],
    emphasis: 'whole-food',
  },
  'vegan-low-cal': {
    calories: [1400, 1500, 1600, 1800, 2000],
    dietTypes: ['vegan'],
    emphasis: 'whole-food',
  },
  'high-protein-vegetarian': {
    calories: [1500, 1600, 1800, 2000, 2200, 2500],
    dietTypes: ['vegetarian'],
    emphasis: 'lean-protein',
  },
  pescatarian: {
    calories: [1500, 1600, 1800, 2000, 2200, 2500],
    dietTypes: ['pescatarian'],
    emphasis: 'lean-protein',
  },
  maintenance: {
    calories: [1600, 1800, 2000, 2200, 2500],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'whole-food',
  },
  'anti-inflammatory': {
    calories: [1400, 1500, 1600, 1800, 2000, 2200, 2500],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'whole-food',
  },
  'menopause-nutrition': {
    calories: [1400, 1500, 1600, 1800, 2000, 2200],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'whole-food',
  },
  'endurance-athlete': {
    calories: [2000, 2200, 2500, 3000, 3500],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'high-carb-fuel',
  },
  cutting: {
    calories: [1400, 1500, 1600, 1800, 2000],
    dietTypes: ['standard', 'vegetarian', 'vegan', 'pescatarian'],
    emphasis: 'lean-protein',
  },
};

const COVERAGE_PRIORITY_MARKETS_BY_GOAL = {
  'budget-bodybuilding': ['sainsburys', 'morrisons', 'tesco', 'asda', 'aldi', 'lidl', 'iceland', 'coop', 'waitrose', 'ocado', 'marks-spencer', 'any'],
  'cheap-high-protein': ['sainsburys', 'morrisons', 'tesco', 'asda', 'aldi', 'lidl', 'iceland', 'coop', 'waitrose', 'ocado', 'marks-spencer', 'any'],
  'endurance-athlete': ['morrisons', 'iceland', 'sainsburys', 'tesco', 'asda', 'aldi', 'lidl', 'waitrose', 'ocado', 'marks-spencer', 'coop', 'any'],
};

const COVERAGE_EFFORT_STYLES = {
  minimal: { label: 'Minimal Prep', emphasis: 'minimal-effort' },
  low: { label: 'Low Effort', emphasis: 'minimal-effort' },
  standard: { label: 'Standard Prep', emphasis: null },
  batch: { label: 'Batch Cook', emphasis: 'batch-cooking' },
  'high-variety': { label: 'High-Variety', emphasis: 'high-variety' },
};

const COVERAGE_BUDGET_TITLE = {
  'very-cheap': 'Very Cheap',
  budget: 'Budget',
  moderate: 'Moderate Budget',
  flexible: 'Flexible Budget',
};

function buildDeepExpansionSeeds(targetCount) {
  const seeds = [];
  let wave = 0;

  while (seeds.length < targetCount) {
    for (let i = 0; i < CORE_PLAN_SEEDS.length && seeds.length < targetCount; i += 1) {
      seeds.push(buildDeepExpandedPlanSeed(CORE_PLAN_SEEDS[i], i, wave));
    }
    wave += 1;
  }

  return seeds;
}

function buildDeepExpandedPlanSeed(seed, index, wave) {
  const style = getDeepExpansionStyle(seed, index, wave);
  const dietType = getDeepExpansionDietType(seed, index, wave);
  const dietSuffix = dietType !== seed.dietType ? `-${dietType}` : '';

  return {
    ...seed,
    slug: `${seed.slug}-${style.slug}${dietSuffix}-v${wave + 3}`,
    dietType,
    effort: style.effort,
    emphasis: style.emphasis,
    mealSetIndex: seed.mealSetIndex + 97 + (wave * 53) + (index % 89),
    title: buildDeepExpandedTitle(seed, style, dietType),
  };
}

function getDeepExpansionStyle(seed, index, wave) {
  const styleSlugs = DEEP_STYLE_SLUGS_BY_GOAL[seed.goal] || DEFAULT_DEEP_STYLE_SLUGS;
  const styleSlug = styleSlugs[(index + (wave * 3)) % styleSlugs.length];
  return DEEP_EXPANSION_STYLE_LIBRARY[styleSlug] || DEEP_EXPANSION_STYLE_LIBRARY['balanced-plate'];
}

function getDeepExpansionDietType(seed, index, wave) {
  if (seed.dietType !== 'standard') return seed.dietType;

  const roll = (index + (wave * 7)) % 12;
  if (roll === 0) {
    return VEGAN_VARIANT_UNSUITABLE_GOALS.has(seed.goal) ? 'vegetarian' : 'vegan';
  }
  if (roll === 4) return 'pescatarian';
  if (roll === 8) return 'vegetarian';
  return 'standard';
}

function buildDeepExpandedTitle(seed, style, dietType) {
  const market = seed.supermarket === 'any' ? '' : `${MARKET_TITLES[seed.supermarket]} `;
  const diet = dietType !== 'standard' && !GOALS_WITH_DIET_IN_TITLE.has(seed.goal)
    ? `${DIET_TITLES[dietType]} `
    : '';
  const goal = GOAL_TITLES[seed.goal] || seed.goal;
  return `${market}${diet}${style.label} Weekly ${goal} Plan \u2014 ${seed.calories.toLocaleString('en-GB')} kcal`;
}

export function isCoverageCombinationFeasible({ goal, supermarket, dietType, calories, budget, effort }) {
  const profile = COVERAGE_GOAL_PROFILES[goal];
  if (!profile) return false;
  if (!COVERAGE_FILTER_VALUES.supermarkets.includes(supermarket)) return false;
  if (!profile.dietTypes.includes(dietType)) return false;
  if (!profile.calories.includes(Number(calories))) return false;
  if (!COVERAGE_FILTER_VALUES.efforts.includes(effort)) return false;
  return getFeasibleBudgetsForCoverage(Number(calories), supermarket).includes(budget);
}

export function getFeasibleBudgetsForCoverage(calories, supermarket) {
  const cals = Number(calories);
  const lowCost = supermarket === 'any' || supermarket === 'aldi' || supermarket === 'lidl' || supermarket === 'iceland';
  const valueStore = lowCost || supermarket === 'asda' || supermarket === 'morrisons';
  const premiumStore = supermarket === 'waitrose' || supermarket === 'ocado' || supermarket === 'marks-spencer';
  const convenienceStore = supermarket === 'coop';
  const budgets = [];

  if (!premiumStore && !convenienceStore && (cals <= 1800 || (cals <= 2000 && lowCost))) {
    budgets.push('very-cheap');
  }
  if (!premiumStore && (cals <= 2500 || (cals <= 3000 && valueStore) || (cals <= 3500 && lowCost))) {
    budgets.push('budget');
  }
  budgets.push('moderate', 'flexible');

  return budgets;
}

function buildCoverageSeeds(seedPool) {
  const seeds = [];
  const usedSlugs = new Set(seedPool.map(seed => seed.slug));
  const coveredCombos = new Set(seedPool.map(buildCoverageKey));

  for (const goal of COVERAGE_FILTER_VALUES.goals) {
    const profile = COVERAGE_GOAL_PROFILES[goal];
    const markets = COVERAGE_PRIORITY_MARKETS_BY_GOAL[goal] || COVERAGE_FILTER_VALUES.supermarkets;

    for (const supermarket of markets) {
      for (const dietType of profile.dietTypes) {
        for (const calories of profile.calories) {
          for (const budget of getFeasibleBudgetsForCoverage(calories, supermarket)) {
            for (const effort of COVERAGE_FILTER_VALUES.efforts) {
              const combo = { goal, supermarket, dietType, calories, budget, effort };
              const comboKey = buildCoverageKey(combo);
              if (coveredCombos.has(comboKey)) continue;

              const seed = buildCoverageSeed(combo, seedPool.length + seeds.length);
              seed.slug = uniqueCoverageSlug(seed.slug, usedSlugs);
              usedSlugs.add(seed.slug);
              coveredCombos.add(comboKey);
              seeds.push(seed);
            }
          }
        }
      }
    }
  }

  return seeds;
}

function buildCoverageSeed(combo, index) {
  const style = COVERAGE_EFFORT_STYLES[combo.effort] || COVERAGE_EFFORT_STYLES.standard;
  const profile = COVERAGE_GOAL_PROFILES[combo.goal] || {};
  const emphasis = style.emphasis || profile.emphasis || 'lean-protein';

  return {
    ...combo,
    slug: buildCoverageSlug(combo),
    mealSetIndex: 1000 + index,
    title: buildCoverageTitle(combo, style),
    emphasis,
  };
}

function buildCoverageSlug({ goal, supermarket, dietType, calories, budget, effort }) {
  const market = supermarket === 'any' ? 'uk' : supermarket;
  const diet = dietType === 'standard' ? '' : `${dietType}-`;
  return `${market}-${diet}${goal}-${calories}-${budget}-${effort}`;
}

function uniqueCoverageSlug(slug, usedSlugs) {
  if (!usedSlugs.has(slug)) return slug;
  let suffix = 2;
  while (usedSlugs.has(`${slug}-${suffix}`)) suffix += 1;
  return `${slug}-${suffix}`;
}

function buildCoverageTitle(combo, style) {
  const market = combo.supermarket === 'any' ? 'UK' : MARKET_TITLES[combo.supermarket];
  const diet = combo.dietType !== 'standard' && !GOALS_WITH_DIET_IN_TITLE.has(combo.goal)
    ? `${DIET_TITLES[combo.dietType]} `
    : '';
  const budget = COVERAGE_BUDGET_TITLE[combo.budget] || combo.budget;
  const goal = GOAL_TITLES[combo.goal] || combo.goal;
  const calories = Number(combo.calories).toLocaleString('en-GB');
  return `${market} ${diet}${budget} ${style.label} ${goal} Plan - ${calories} kcal`;
}

function buildCoverageKey({ goal, supermarket, dietType, calories, budget, effort }) {
  return `${goal}|${supermarket}|${dietType}|${calories}|${budget}|${effort}`;
}

const ADDITIONAL_PLAN_SEEDS = CORE_PLAN_SEEDS.map(buildExpandedPlanSeed);
const BASE_PLAN_SEEDS = [...CORE_PLAN_SEEDS, ...ADDITIONAL_PLAN_SEEDS];
const DEEP_EXPANSION_SEEDS = buildDeepExpansionSeeds(Math.max(0, TARGET_PLAN_COUNT - BASE_PLAN_SEEDS.length));
const INDEXABLE_PLAN_SEED_POOL = [...BASE_PLAN_SEEDS, ...DEEP_EXPANSION_SEEDS];
export const COVERAGE_PLAN_SEEDS = buildCoverageSeeds(INDEXABLE_PLAN_SEED_POOL);

export const INDEXABLE_PLAN_SEEDS = INDEXABLE_PLAN_SEED_POOL;
export const PLAN_SEEDS = [...INDEXABLE_PLAN_SEED_POOL, ...COVERAGE_PLAN_SEEDS];
// PLAN_COUNT is shown to users ("Browse X free UK meal plans") and must reflect
// real, indexed, prerendered pages — not PLAN_SEEDS.length, which also includes
// the much larger synthetic COVERAGE_PLAN_SEEDS pool used for coverage checks
// and was never meant to be a public-facing number.
export const PLAN_COUNT = INDEXABLE_PLAN_SEEDS.length;
