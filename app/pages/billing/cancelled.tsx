import { Link, BlitzPage } from "blitz";
import Layout from "app/core/layouts/Layout";

const BillingCancelled: BlitzPage = () => {
  return (
    <div className="container">
      <main>
        <p>Your subscription has been cancelled.</p>
        <Link href="/">
          <a>Back to home</a>
        </Link>
      </main>
    </div>
  );
};

BillingCancelled.suppressFirstRenderFlicker = true;
BillingCancelled.getLayout = (page) => <Layout title="Success">{page}</Layout>;

export default BillingCancelled;
