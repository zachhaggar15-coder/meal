import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>Generator</h4>
          <ul>
            <li><Link to="/">Free Meal Plan Generator</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Calorie Plans</h4>
          <ul>
            <li><Link to="/meal-plan/1500-calorie-meal-plan">1500 Calorie Meal Plan</Link></li>
            <li><Link to="/meal-plan/1800-calorie-meal-plan">1800 Calorie Meal Plan</Link></li>
            <li><Link to="/meal-plan/2000-calorie-meal-plan">2000 Calorie Meal Plan</Link></li>
            <li><Link to="/meal-plan/high-protein-low-calorie-meal-plan">High Protein Plan</Link></li>
            <li><Link to="/meal-plan/tesco-low-calorie-meal-plan">Tesco Meal Plan</Link></li>
            <li><Link to="/meal-plan/aldi-low-calorie-meal-plan">Aldi Meal Plan</Link></li>
            <li><Link to="/meal-plan/vegetarian-low-calorie-meal-plan">Vegetarian Plan</Link></li>
            <li><Link to="/meal-plan/vegan-low-calorie-meal-plan">Vegan Plan</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Weight Loss Guides</h4>
          <ul>
            <li><Link to="/blog/how-to-build-a-calorie-deficit">Calorie Deficit Guide</Link></li>
            <li><Link to="/blog/best-low-calorie-foods-uk">Best Low Calorie Foods UK</Link></li>
            <li><Link to="/blog/high-protein-low-calorie-meals">High Protein Meals</Link></li>
            <li><Link to="/blog/tesco-low-calorie-shopping-list">Tesco Shopping List</Link></li>
            <li><Link to="/blog/how-to-meal-plan-for-weight-loss">How to Meal Plan</Link></li>
            <li><Link to="/blog/how-many-calories-to-lose-weight">How Many Calories to Lose Weight</Link></li>
          </ul>
        </div>
      </div>
      <p className="footer-copy footer-disclaimer">
        Meal plans are generated for general information only. Calories and protein are estimates. For medical conditions, pregnancy, eating disorders, or clinical dietary needs, speak to a qualified healthcare professional.
      </p>
      <p className="footer-copy">
        © {new Date().getFullYear()} MealPrep.org.uk — Free UK Meal Plan Generator.
      </p>
    </footer>
  );
}
