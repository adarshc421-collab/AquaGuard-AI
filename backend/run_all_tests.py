import os
import sys
import traceback
import importlib

# Fix Windows console encoding
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

TEST_MODULES = [
    "tests.test_determinism",
    "tests.test_detector",
    "tests.test_verification",
    "tests.test_quality",
    "tests.test_risk",
    "tests.test_hotspots",
    "tests.test_inspection_planner",
    "tests.test_api",
]


def run_all_tests():
    print("================================================================")
    print(" AQUAGUARD AI — AUTOMATED TEST SUITE & VERIFICATION HARNESS ")
    print("================================================================")
    
    passed_count = 0
    failed_count = 0
    failures = []

    for mod_name in TEST_MODULES:
        print(f"\n[RUNNING MODULE] {mod_name}...")
        try:
            mod = importlib.import_module(mod_name)
            # Find and run all test_* functions
            for attr_name in dir(mod):
                if attr_name.startswith("test_") and callable(getattr(mod, attr_name)):
                    func = getattr(mod, attr_name)
                    print(f"  -> Executing {attr_name}()...")
                    try:
                        func()
                        passed_count += 1
                    except Exception as e:
                        failed_count += 1
                        err_msg = f"{mod_name}.{attr_name}: {e}\n{traceback.format_exc()}"
                        failures.append(err_msg)
                        print(f"  [FAIL] {attr_name}: {e}")
        except Exception as e:
            failed_count += 1
            err_msg = f"Failed to import {mod_name}: {e}\n{traceback.format_exc()}"
            failures.append(err_msg)
            print(f"[FAIL] Module import failed: {e}")

    print("\n================================================================")
    print(f" TEST SUITE SUMMARY: {passed_count} PASSED | {failed_count} FAILED")
    print("================================================================")
    
    if failed_count > 0:
        print("\nFAILURES:")
        for f in failures:
            print("----------------------------------------------------------------")
            print(f)
        sys.exit(1)
    else:
        print("\nALL SYSTEM TESTS PASSED CLEANLY WITH ZERO ERRORS!")
        sys.exit(0)


if __name__ == "__main__":
    run_all_tests()
