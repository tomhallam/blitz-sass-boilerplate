import { Link, BlitzPage } from "blitz";
import Layout from "app/core/layouts/Layout";
import Guard from "app/guard/ability";

const Success: BlitzPage = () => {
  return (
    <div className="container">
      <main>
        <p>Success!</p>
        <Link href="/">
          <a>Back to home</a>
        </Link>
      </main>
    </div>
  );
};

Success.suppressFirstRenderFlicker = true;
Success.getLayout = (page) => <Layout title="Success">{page}</Layout>;

export default Success;
