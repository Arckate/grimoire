import Button from "@site/src/components/button/Button";
import WrapButton from "@site/src/components/button/WrapButton";
import HeroBanner from "@site/src/components/HeroBanner";
import ImgLink from "@site/src/components/ImgLink/ImgLink";
import LogoGrimoire from "@site/src/components/LogoGrimoire/LogoGrimoire";
import Section from "@site/src/components/Section";
import SectionAction from "@site/src/components/SectionAction";
import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";
import MDXComponents from "@theme-original/MDXComponents";
import { DiGithubBadge } from "react-icons/di";
import { MdArrowForward } from "react-icons/md";

export default {
	...MDXComponents,
	HeroBanner,
	LogoGrimoire,
	Button,
	DiGithubBadge,
	MdArrowForward,
	WrapButton,
	Section,
	SectionAction,
	ImgLink,
	Tabs,
	TabItem,
};
