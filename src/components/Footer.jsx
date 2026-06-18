import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>Generator</h4>
          <ul>
            <li><Link to="/">Free Meal Plan Generator</Link></li>
            <li><Link to="/browse">Browse All Meal Plans</Link></li>
            <li><Link to="/blog">Meal Prep Blog</Link></li>
            <li><Link to="/about">About &amp; Editorial Notes</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Calorie Plans</h4>
          <ul>
            <li><Link to="/meal-plans/1500-calorie">1500 Calorie Meal Plans</Link></li>
            <li><Link to="/meal-plans/1800-calorie">1800 Calorie Meal Plans</Link></li>
            <li><Link to="/meal-plans/2000-calorie">2000 Calorie Meal Plans</Link></li>
            <li><Link to="/meal-plans/2500-calorie">2500 Calorie Meal Plans</Link></li>
            <li><Link to="/meal-plans/high-protein">High Protein Meal Plans</Link></li>
            <li><Link to="/meal-plans/weight-loss">Weight Loss Meal Plans</Link></li>
            <li><Link to="/meal-plans/tesco">Tesco Meal Plans</Link></li>
            <li><Link to="/meal-plans/aldi">Aldi Meal Plans</Link></li>
            <li><Link to="/meal-plans/lidl">Lidl Meal Plans</Link></li>
            <li><Link to="/meal-plans/vegetarian">Vegetarian Meal Plans</Link></li>
            <li><Link to="/meal-plans/vegan">Vegan Meal Plans</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Printable Plans</h4>
          <ul>
            <li><Link to="/meal-plans/printable-meal-plans">Printable Meal Plans</Link></li>
            <li><Link to="/meal-plans/meal-plans-with-shopping-list">Plans with Shopping Lists</Link></li>
            <li><Link to="/meal-plans/low-calorie-shopping-list">Low Calorie Shopping List</Link></li>
            <li><Link to="/meal-plans/high-protein-shopping-list">High Protein Shopping List</Link></li>
            <li><Link to="/meal-plans/budget-shopping-list">Budget Shopping List</Link></li>
            <li><Link to="/meal-prep-containers/budget">Budget Meal Prep Containers</Link></li>
            <li><Link to="/meal-prep-containers/mid-range">Glass Meal Prep Containers</Link></li>
            <li><Link to="/meal-prep-containers/premium">Premium Meal Prep Containers</Link></li>
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
