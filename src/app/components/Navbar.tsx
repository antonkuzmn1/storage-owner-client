import {Link, useLocation} from "react-router-dom";
import {
    AccountCircle,
    AdminPanelSettings,
    Apartment,
    Construction,
    Group,
    Settings
} from "@mui/icons-material";
import {useSelector} from "react-redux";
import {RootState} from "../../utils/store.ts";

const Navbar = () => {
    const location = useLocation();

    const deviceSize = useSelector((state: RootState) => state.device.size);

    const getLinkClass = (path: string) =>
        location.pathname === path
            ? "bg-gray-300 text-black p-4 w-full text-center"
            : "hover:bg-gray-300 text-black p-4 transition-colors duration-200 w-full text-center";

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 text-black">
            <div className="flex">
                <Link to="/companies" className={getLinkClass("/companies")}>
                    <div className="flex items-center justify-center space-x-2">
                        <Apartment sx={{color: 'black'}}/>
                        {deviceSize === 'Large' && <span>Companies</span>}
                    </div>
                </Link>
                <Link to="/users" className={getLinkClass("/users")}>
                    <div className="flex items-center justify-center space-x-2">
                        <Group sx={{color: 'black'}}/>
                        {deviceSize === 'Large' && <span>Users</span>}
                    </div>
                </Link>
                <Link to="/admins" className={getLinkClass("/admins")}>
                    <div className="flex items-center justify-center space-x-2">
                        <AdminPanelSettings sx={{color: 'black'}}/>
                        {deviceSize === 'Large' && <span>Admins</span>}
                    </div>
                </Link>
                <Link to="/owners" className={getLinkClass("/owners")}>
                    <div className="flex items-center justify-center space-x-2">
                        <Construction sx={{color: 'black'}}/>
                        {deviceSize === 'Large' && <span>Owners</span>}
                    </div>
                </Link>
                <Link to="/config" className={getLinkClass("/config")}>
                    <div className="flex items-center justify-center space-x-2">
                        <Settings sx={{color: 'black'}}/>
                        {deviceSize === 'Large' && <span>Config</span>}
                    </div>
                </Link>
                <Link to="/me" className={getLinkClass("/me")}>
                    <div className="flex items-center justify-center space-x-2">
                        <AccountCircle sx={{color: 'black'}}/>
                        {deviceSize === 'Large' && <span>Me</span>}
                    </div>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
