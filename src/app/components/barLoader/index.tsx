import { LoaderSize } from "@utils/constant";
import ContentLoader  from "react-content-loader";
import Theme from "theme";

interface Props {
    loaderSize?: LoaderSize,
}
const BarLoader: React.FC<Props> = ({ loaderSize}) => {
    function getHeight() {
        switch (loaderSize) {
            case LoaderSize.SMALLEST:
                return 10;
            case LoaderSize.SMALL:
                return 15;
            case LoaderSize.MEDIUM:
                return 25;
            case LoaderSize.LARGE:
                return 30;
            default:
                return 15;
        }
    }

    function getWidth() {
        switch (loaderSize) {
            case LoaderSize.SMALLEST:
                return 120;
            case LoaderSize.SMALL:
                return 150;
            case LoaderSize.MEDIUM:
                return 250;
            case LoaderSize.LARGE:
                return 300;
            default:
                return 100;
        }
    }

    function getRadius() {
        switch (loaderSize) {
          case LoaderSize.SMALL:
            return 5;
          case LoaderSize.MEDIUM:
            return 5;
          case LoaderSize.LARGE:
            return 10;
          default:
            return 5;
        }
      }

    return (
        <ContentLoader
            animate={true}
            speed={1}
            interval={0.1}
            viewBox="0 0 380 40"
            backgroundColor={Theme.colors.background.elevation1}
            foregroundColor={Theme.colors.grey}>
            <rect y="0" x="0" rx={getRadius()} ry={getRadius()} width={getWidth()} height={getHeight()}/>
        </ContentLoader>
    );
};

export default BarLoader;
