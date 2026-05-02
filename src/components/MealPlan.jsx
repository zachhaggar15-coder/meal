export default function MealPlan({ weeklyPlan }) {
  if (!Array.isArray(weeklyPlan) || weeklyPlan.length === 0) return null;

  return (
    <section>
      <h2 style={{ margin: '24px 0 12px' }}>Your weekly plan</h2>
      {weeklyPlan.map((day, idx) => (
        <div key={idx} className="card day-card">
          <h3>{day.day || `Day ${idx + 1}`}</h3>
          {Array.isArray(day.meals) &&
            day.meals.map((meal, mIdx) => (
              <div key={mIdx} className="meal">
                <div className="meal-header">
                  <div>
                    <span className="meal-type">{meal.type}</span>
                    <span className="meal-name">{meal.name}</span>
                  </div>
                  <div className="meal-meta">
                    {meal.calories ? `${meal.calories} kcal` : ''}
                    {meal.protein ? ` · ${meal.protein}g protein` : ''}
                    {meal.prep_time ? ` · ${meal.prep_time}` : ''}
                  </div>
                </div>
                {meal.description && <p className="meal-desc">{meal.description}</p>}
                {meal.portion_size && (
                  <p className="meal-portion"><strong>Portion:</strong> {meal.portion_size}</p>
                )}
              </div>
            ))}
          {day.daily_totals && (
            <div className="daily-totals">
              Daily total:{' '}
              {day.daily_totals.calories || 0} kcal ·{' '}
              {day.daily_totals.protein || 0}g protein
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
